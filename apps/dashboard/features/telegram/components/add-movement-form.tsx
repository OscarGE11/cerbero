"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createTelegramMovement,
  getTelegramCategories,
  getTelegramUserCategories,
} from "@/features/telegram/api";
import { useTelegramMe } from "@/features/telegram/hooks";
import {
  formatCurrency,
  formatDisplayDate,
  formatMovementType,
  parseMovementDate,
  parsePositiveAmount,
  shiftIsoDate,
  todayIsoDate,
} from "@/features/telegram/lib/movement-form";
import { useTelegram } from "@/lib/telegram/provider";
import { TelegramPrimaryButton, TelegramShell } from "@/lib/telegram/shell";
import type { Category, MovementType, UserCategory } from "@cerbero/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

type Step = "type" | "category" | "custom" | "details" | "date" | "confirm";

interface Draft {
  type?: MovementType;
  categoryId?: string;
  categoryName?: string;
  customCategory?: string;
  title?: string;
  amount?: number;
  date?: string;
}

function TypeStep({
  onSelect,
}: {
  onSelect: (type: MovementType) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Button
        type="button"
        variant="outline"
        className="h-20 rounded-xl border-white/[0.08] text-expense"
        onClick={() => onSelect("expense")}
      >
        Gasto
      </Button>
      <Button
        type="button"
        variant="outline"
        className="h-20 rounded-xl border-white/[0.08] text-income"
        onClick={() => onSelect("income")}
      >
        Ingreso
      </Button>
    </div>
  );
}

function CategoryStep({
  categories,
  loading,
  onSelect,
}: {
  categories: Category[];
  loading: boolean;
  onSelect: (category: Category) => void;
}) {
  if (loading) {
    return (
      <p className="text-sm text-muted-foreground">Cargando categorías…</p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {categories.map((category) => (
        <Button
          key={category.id}
          type="button"
          variant="outline"
          className="h-12 justify-start rounded-xl border-white/[0.08] px-3 text-sm"
          onClick={() => onSelect(category)}
        >
          {category.name}
        </Button>
      ))}
    </div>
  );
}

function SavedCategoryStep({
  saved,
  onSelectSaved,
  onWriteNew,
}: {
  saved: UserCategory[];
  onSelectSaved: (name: string) => void;
  onWriteNew: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {saved.map((category) => (
          <Button
            key={category.id}
            type="button"
            variant="outline"
            className="h-12 rounded-xl border-white/[0.08] text-sm"
            onClick={() => onSelectSaved(category.name)}
          >
            {category.name}
          </Button>
        ))}
      </div>
      <Button
        type="button"
        variant="secondary"
        className="h-11 w-full rounded-xl"
        onClick={onWriteNew}
      >
        Escribir nueva categoría
      </Button>
    </div>
  );
}

export function AddMovementForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    initData,
    hapticSuccess,
    hapticError,
    showMainButton,
    hideMainButton,
    showBackButton,
    hideBackButton,
    close,
  } = useTelegram();
  const { data: me } = useTelegramMe();

  const [step, setStep] = useState<Step>("type");
  const [draft, setDraft] = useState<Draft>({});
  const [amountInput, setAmountInput] = useState("");
  const [dateInput, setDateInput] = useState(todayIsoDate());
  const [customCategoryInput, setCustomCategoryInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [savedCategories, setSavedCategories] = useState<UserCategory[]>([]);

  const movementType = draft.type;

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["telegram", "categories", movementType, initData],
    queryFn: () => {
      if (!movementType) {
        throw new Error("movementType is required");
      }
      return getTelegramCategories(initData, movementType);
    },
    enabled: Boolean(initData) && Boolean(movementType) && step === "category",
  });

  const createMutation = useMutation({
    mutationFn: (payload: {
      type: MovementType;
      title: string;
      amount: number;
      date?: string;
      categoryId?: string;
      customCategory?: string;
    }) => createTelegramMovement(initData, payload),
    onSuccess: async () => {
      hapticSuccess();
      await queryClient.invalidateQueries({ queryKey: ["telegram"] });
      setStep("confirm");
    },
    onError: (err) => {
      hapticError();
      setError(err instanceof Error ? err.message : "No se pudo guardar");
    },
  });

  const submitMovement = useCallback(
    (dateOverride?: string) => {
      const date = dateOverride ?? draft.date;
      if (!draft.type || !draft.title?.trim() || !draft.amount || !date) {
        setError("Completa todos los campos.");
        return;
      }
      if (!draft.categoryId && !draft.customCategory) {
        setError("Selecciona una categoría.");
        return;
      }
      setError(null);
      setDraft((current) => ({ ...current, date }));
      createMutation.mutate({
        type: draft.type,
        title: draft.title.trim(),
        amount: draft.amount,
        date,
        ...(draft.categoryId ? { categoryId: draft.categoryId } : {}),
        ...(draft.customCategory
          ? { customCategory: draft.customCategory }
          : {}),
      });
    },
    [createMutation, draft],
  );

  const stepTitle = useMemo(() => {
    switch (step) {
      case "type":
        return "¿Gasto o ingreso?";
      case "category":
        return draft.type === "income"
          ? "Categoría de ingreso"
          : "Categoría de gasto";
      case "custom":
        return "Categoría personalizada";
      case "details":
        return "Detalles del movimiento";
      case "date":
        return "¿Cuándo fue?";
      case "confirm":
        return "Movimiento guardado";
      default:
        return "Añadir movimiento";
    }
  }, [step, draft.type]);

  const goBack = useCallback(() => {
    setError(null);
    if (step === "category") setStep("type");
    else if (step === "custom") setStep("category");
    else if (step === "details") setStep("category");
    else if (step === "date") setStep("details");
    else if (step === "confirm") router.push("/telegram");
    else router.push("/telegram");
  }, [router, step]);

  const continueFromDetails = useCallback(() => {
    const amount = parsePositiveAmount(amountInput);
    const title = draft.title?.trim();
    if (!title) {
      setError("El título es obligatorio.");
      hapticError();
      return;
    }
    if (amount === null) {
      setError("Importe no válido.");
      hapticError();
      return;
    }
    setDraft((current) => ({ ...current, amount }));
    setError(null);
    setStep("date");
  }, [amountInput, draft.title, hapticError]);

  const continueFromCustomCategory = useCallback(() => {
    const name = customCategoryInput.trim();
    if (!name) {
      setError("La categoría no puede estar vacía.");
      hapticError();
      return;
    }
    setDraft((current) => ({
      ...current,
      customCategory: name,
      categoryName: name,
      categoryId: undefined,
    }));
    setError(null);
    setStep("details");
  }, [customCategoryInput, hapticError]);

  useEffect(() => {
    if (step === "type" || step === "confirm") {
      hideBackButton();
      return;
    }
    showBackButton(goBack);
    return () => hideBackButton();
  }, [step, goBack, showBackButton, hideBackButton]);

  useEffect(() => {
    if (step === "custom") {
      showMainButton("Continuar", continueFromCustomCategory);
      return () => hideMainButton();
    }

    if (step === "details") {
      showMainButton("Continuar", continueFromDetails);
      return () => hideMainButton();
    }

    if (step === "date") {
      showMainButton("Guardar", () => {
        const parsed =
          parseMovementDate(dateInput) ?? parseMovementDate(todayIsoDate());
        if (!parsed) {
          setError("Fecha no válida.");
          hapticError();
          return;
        }
        submitMovement(parsed);
      });
      return () => hideMainButton();
    }

    if (step === "confirm") {
      showMainButton("Cerrar", () => close());
      return () => hideMainButton();
    }

    hideMainButton();
  }, [
    step,
    dateInput,
    continueFromCustomCategory,
    continueFromDetails,
    showMainButton,
    hideMainButton,
    submitMovement,
    close,
    hapticError,
  ]);

  async function handleCategorySelect(category: Category) {
    if (category.name === "Otro") {
      if (!movementType) return;
      const saved = await getTelegramUserCategories(initData, movementType);
      setSavedCategories(saved);
      if (saved.length === 0) {
        setStep("custom");
        return;
      }
      setStep("custom");
      return;
    }

    setDraft((current) => ({
      ...current,
      categoryId: category.id,
      categoryName: category.name,
      customCategory: undefined,
    }));
    setStep("details");
  }

  function handleDetailsContinue(e: React.FormEvent) {
    e.preventDefault();
    continueFromDetails();
  }

  if (!me?.linked) {
    return (
      <TelegramShell title="Añadir movimiento">
        <p className="text-sm text-muted-foreground">
          Primero debes vincular tu cuenta.
        </p>
        <Button
          className="mt-4 h-11 w-full rounded-xl"
          onClick={() => router.push("/telegram/link")}
        >
          Vincular cuenta
        </Button>
      </TelegramShell>
    );
  }

  return (
    <TelegramShell title={stepTitle}>
      {step === "type" && (
        <TypeStep
          onSelect={(type) => {
            setDraft({ type });
            setStep("category");
          }}
        />
      )}

      {step === "category" && (
        <CategoryStep
          categories={categories}
          loading={categoriesLoading}
          onSelect={handleCategorySelect}
        />
      )}

      {step === "custom" && (
        <div className="space-y-4">
          {savedCategories.length > 0 ? (
            <SavedCategoryStep
              saved={savedCategories}
              onSelectSaved={(name) => {
                setDraft((current) => ({
                  ...current,
                  customCategory: name,
                  categoryName: name,
                  categoryId: undefined,
                }));
                setStep("details");
              }}
              onWriteNew={() => setCustomCategoryInput("")}
            />
          ) : null}
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              continueFromCustomCategory();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="custom-category">Nombre de categoría</Label>
              <Input
                id="custom-category"
                value={customCategoryInput}
                onChange={(e) => setCustomCategoryInput(e.target.value)}
                placeholder="Ej. Supermercado"
              />
            </div>
            <TelegramPrimaryButton type="submit">
              Continuar
            </TelegramPrimaryButton>
          </form>
        </div>
      )}

      {step === "details" && (
        <form className="space-y-4" onSubmit={handleDetailsContinue}>
          <div className="space-y-2">
            <Label htmlFor="movement-title">Título</Label>
            <Input
              id="movement-title"
              value={draft.title ?? ""}
              onChange={(e) =>
                setDraft((current) => ({ ...current, title: e.target.value }))
              }
              placeholder="Ej. Cena con amigos"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="movement-amount">Importe (€)</Label>
            <Input
              id="movement-amount"
              inputMode="decimal"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              placeholder="25.50"
              required
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <TelegramPrimaryButton type="submit">Continuar</TelegramPrimaryButton>
        </form>
      )}

      {step === "date" && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Hoy", value: todayIsoDate() },
              { label: "Ayer", value: shiftIsoDate(1) },
              { label: "Anteayer", value: shiftIsoDate(2) },
            ].map((option) => (
              <Button
                key={option.label}
                type="button"
                variant="outline"
                className="rounded-xl border-white/[0.08]"
                onClick={() => setDateInput(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
          <div className="space-y-2">
            <Label htmlFor="movement-date">Fecha</Label>
            <Input
              id="movement-date"
              type="date"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {createMutation.isPending ? (
            <p className="text-sm text-muted-foreground">Guardando…</p>
          ) : null}
        </div>
      )}

      {step === "confirm" && draft.type && draft.amount && draft.date ? (
        <div className="space-y-4 text-sm">
          <p className="text-income">Movimiento guardado correctamente.</p>
          <div className="rounded-xl border border-white/[0.08] bg-card p-4 space-y-1">
            <p>Tipo: {formatMovementType(draft.type)}</p>
            <p>Categoría: {draft.customCategory ?? draft.categoryName}</p>
            <p>Título: {draft.title}</p>
            <p>Importe: {formatCurrency(draft.amount)}</p>
            <p>Fecha: {formatDisplayDate(draft.date)}</p>
          </div>
          <TelegramPrimaryButton onClick={() => close()}>
            Cerrar
          </TelegramPrimaryButton>
        </div>
      ) : null}
    </TelegramShell>
  );
}
