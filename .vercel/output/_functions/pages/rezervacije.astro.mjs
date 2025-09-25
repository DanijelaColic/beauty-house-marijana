/* empty css                                 */
import { e as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_DFoPc-bF.mjs';
import 'kleur/colors';
import { b as $$BaseLayout, $ as $$Header, a as $$Footer } from '../chunks/Footer_DuojWUfv.mjs';
import * as React from 'react';
import React__default, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { c as bookingFormSchema } from '../chunks/validation_DlZn1w71.mjs';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Loader2, Clock, Euro, X, Check, Calendar, User, CheckCircle, Mail, Phone, MessageSquare } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { startOfDay, addDays, format } from 'date-fns';
import { hr } from 'date-fns/locale';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import * as LabelPrimitive from '@radix-ui/react-label';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
export { renderers } from '../renderers.mjs';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Card = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ React.createElement(
  "div",
  {
    ref,
    className: cn(
      "bg-surface rounded-2xl border border-border shadow-soft",
      className
    ),
    ...props
  }
));
Card.displayName = "Card";
const CardHeader = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ React.createElement("div", { ref, className: cn("flex flex-col space-y-1.5 p-6", className), ...props }));
CardHeader.displayName = "CardHeader";
const CardTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ React.createElement(
  "h3",
  {
    ref,
    className: cn(
      "text-xl font-semibold leading-none tracking-tight text-textPrimary",
      className
    ),
    ...props
  }
));
CardTitle.displayName = "CardTitle";
const CardDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ React.createElement("p", { ref, className: cn("text-sm text-textSecondary", className), ...props }));
CardDescription.displayName = "CardDescription";
const CardContent = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ React.createElement("div", { ref, className: cn("p-6 pt-0", className), ...props }));
CardContent.displayName = "CardContent";
const CardFooter = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ React.createElement("div", { ref, className: cn("flex items-center p-6 pt-0", className), ...props }));
CardFooter.displayName = "CardFooter";

function ServiceSelect({
  services,
  loading,
  onSelect,
  error,
  selectedServiceId
}) {
  if (loading) {
    return /* @__PURE__ */ React__default.createElement("div", { className: "flex items-center justify-center py-8" }, /* @__PURE__ */ React__default.createElement(Loader2, { className: "w-8 h-8 animate-spin text-primary" }), /* @__PURE__ */ React__default.createElement("span", { className: "ml-2 text-textSecondary" }, "Učitavam usluge..."));
  }
  if (error) {
    return /* @__PURE__ */ React__default.createElement("div", { className: "text-center py-8" }, /* @__PURE__ */ React__default.createElement("p", { className: "text-red-500" }, error));
  }
  if (services.length === 0) {
    return /* @__PURE__ */ React__default.createElement("div", { className: "text-center py-8" }, /* @__PURE__ */ React__default.createElement("p", { className: "text-textSecondary" }, "Trenutno nema dostupnih usluga."));
  }
  return /* @__PURE__ */ React__default.createElement("div", { className: "space-y-3" }, services.map((service) => /* @__PURE__ */ React__default.createElement(
    Card,
    {
      key: service.id,
      className: `cursor-pointer transition-all hover:border-primary hover:shadow-md ${selectedServiceId === service.id ? "border-primary bg-primary/5 shadow-md" : ""}`,
      onClick: () => onSelect(service.id)
    },
    /* @__PURE__ */ React__default.createElement(CardContent, { className: "p-4" }, /* @__PURE__ */ React__default.createElement("div", { className: "flex items-start justify-between" }, /* @__PURE__ */ React__default.createElement("div", { className: "flex-1" }, /* @__PURE__ */ React__default.createElement("h3", { className: "font-semibold text-textPrimary mb-1" }, service.name), service.description && /* @__PURE__ */ React__default.createElement("p", { className: "text-sm text-textSecondary mb-2" }, service.description), /* @__PURE__ */ React__default.createElement("div", { className: "flex items-center gap-4 text-sm text-textSecondary" }, /* @__PURE__ */ React__default.createElement("div", { className: "flex items-center gap-1" }, /* @__PURE__ */ React__default.createElement(Clock, { className: "w-4 h-4" }), /* @__PURE__ */ React__default.createElement("span", null, service.duration, " min")), service.price && /* @__PURE__ */ React__default.createElement("div", { className: "flex items-center gap-1" }, /* @__PURE__ */ React__default.createElement(Euro, { className: "w-4 h-4" }), /* @__PURE__ */ React__default.createElement("span", null, service.price)))), /* @__PURE__ */ React__default.createElement("div", { className: `w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedServiceId === service.id ? "border-primary bg-primary" : "border-border"}` }, selectedServiceId === service.id && /* @__PURE__ */ React__default.createElement("div", { className: "w-2 h-2 bg-white rounded-full" }))))
  )));
}

function DatePicker({ value, onChange, error }) {
  const selectedDate = value ? new Date(value) : void 0;
  const today = startOfDay(/* @__PURE__ */ new Date());
  const maxDate = addDays(today, 30);
  const handleDaySelect = (date) => {
    if (date) {
      const formatted = format(date, "yyyy-MM-dd");
      onChange(formatted);
    }
  };
  const disabledDays = {
    before: addDays(today, 1),
    // Can't book for today or past days
    after: maxDate
  };
  return /* @__PURE__ */ React__default.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ React__default.createElement(Card, null, /* @__PURE__ */ React__default.createElement(CardContent, { className: "p-4" }, /* @__PURE__ */ React__default.createElement(
    DayPicker,
    {
      mode: "single",
      selected: selectedDate,
      onSelect: handleDaySelect,
      disabled: disabledDays,
      locale: hr,
      className: "mx-auto",
      classNames: {
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium text-textPrimary",
        nav: "space-x-1 flex items-center",
        nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-textPrimary",
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-textSecondary rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-primary [&:has([aria-selected])]:text-white first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-primary/10 rounded-md transition-colors",
        day_selected: "bg-primary text-white hover:bg-primary hover:text-white focus:bg-primary focus:text-white",
        day_today: "bg-gold/20 text-textPrimary font-semibold",
        day_outside: "text-textSecondary opacity-50",
        day_disabled: "text-textSecondary opacity-50 cursor-not-allowed",
        day_range_middle: "aria-selected:bg-primary aria-selected:text-white",
        day_hidden: "invisible"
      },
      components: {
        IconLeft: () => /* @__PURE__ */ React__default.createElement("span", null, "←"),
        IconRight: () => /* @__PURE__ */ React__default.createElement("span", null, "→")
      }
    }
  ))), selectedDate && /* @__PURE__ */ React__default.createElement("div", { className: "text-center p-3 bg-primary/5 rounded-xl" }, /* @__PURE__ */ React__default.createElement("p", { className: "text-sm text-textSecondary" }, "Odabrani datum:"), /* @__PURE__ */ React__default.createElement("p", { className: "font-medium text-textPrimary" }, format(selectedDate, "EEEE, d. MMMM yyyy.", { locale: hr }))), error && /* @__PURE__ */ React__default.createElement("p", { className: "text-red-500 text-sm text-center" }, error));
}

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-2xl font-medium transition shadow-soft disabled:opacity-60 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        default: "bg-primary text-white hover:brightness-110 active:scale-[.98]",
        secondary: "bg-gold text-white hover:brightness-110 active:scale-[.98]",
        outline: "border border-gold text-textPrimary bg-transparent hover:bg-gold/10 active:scale-[.98]",
        ghost: "hover:bg-gold/10 active:scale-[.98]",
        destructive: "bg-red-500 text-white hover:bg-red-600 active:scale-[.98]"
      },
      size: {
        default: "px-5 py-3",
        sm: "px-3 py-2 text-sm",
        lg: "px-6 py-4",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return /* @__PURE__ */ React.createElement(
      Comp,
      {
        className: cn(buttonVariants({ variant, size, className })),
        ref,
        ...props
      }
    );
  }
);
Button.displayName = "Button";

function SlotPicker({ slots, onSelect, error, selectedTime }) {
  const [selectedSlot, setSelectedSlot] = useState(selectedTime || null);
  const handleSlotSelect = (time) => {
    setSelectedSlot(time);
    onSelect(time);
  };
  const availableSlots = slots.filter((slot) => slot.available);
  const unavailableSlots = slots.filter((slot) => !slot.available);
  if (slots.length === 0) {
    return /* @__PURE__ */ React__default.createElement(Card, null, /* @__PURE__ */ React__default.createElement(CardContent, { className: "p-6 text-center" }, /* @__PURE__ */ React__default.createElement(Clock, { className: "w-12 h-12 mx-auto text-textSecondary mb-4" }), /* @__PURE__ */ React__default.createElement("h3", { className: "font-medium text-textPrimary mb-2" }, "Nema dostupnih termina"), /* @__PURE__ */ React__default.createElement("p", { className: "text-sm text-textSecondary" }, "Za odabrani datum trenutno nema slobodnih termina. Molimo odaberite drugi datum.")));
  }
  return /* @__PURE__ */ React__default.createElement("div", { className: "space-y-6" }, availableSlots.length > 0 && /* @__PURE__ */ React__default.createElement("div", null, /* @__PURE__ */ React__default.createElement("h3", { className: "font-medium text-textPrimary mb-3 flex items-center gap-2" }, /* @__PURE__ */ React__default.createElement(Clock, { className: "w-5 h-5" }), "Dostupni termini"), /* @__PURE__ */ React__default.createElement("div", { className: "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3" }, availableSlots.map((slot) => /* @__PURE__ */ React__default.createElement(
    Button,
    {
      key: slot.time,
      variant: selectedSlot === slot.time ? "default" : "outline",
      size: "sm",
      onClick: () => handleSlotSelect(slot.time),
      className: "h-12"
    },
    slot.time
  )))), unavailableSlots.length > 0 && /* @__PURE__ */ React__default.createElement("div", null, /* @__PURE__ */ React__default.createElement("h3", { className: "font-medium text-textSecondary mb-3 flex items-center gap-2" }, /* @__PURE__ */ React__default.createElement(X, { className: "w-5 h-5" }), "Zauzeti termini"), /* @__PURE__ */ React__default.createElement("div", { className: "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3" }, unavailableSlots.slice(0, 10).map((slot) => (
    // Show only first 10 to avoid clutter
    /* @__PURE__ */ React__default.createElement(
      Button,
      {
        key: slot.time,
        variant: "ghost",
        size: "sm",
        disabled: true,
        className: "h-12 opacity-50 cursor-not-allowed",
        title: slot.reason
      },
      slot.time
    )
  ))), unavailableSlots.length > 10 && /* @__PURE__ */ React__default.createElement("p", { className: "text-xs text-textSecondary mt-2" }, "... i još ", unavailableSlots.length - 10, " zauzetih termina")), selectedSlot && /* @__PURE__ */ React__default.createElement(Card, null, /* @__PURE__ */ React__default.createElement(CardContent, { className: "p-4" }, /* @__PURE__ */ React__default.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React__default.createElement("div", null, /* @__PURE__ */ React__default.createElement("p", { className: "text-sm text-textSecondary" }, "Odabrano vrijeme:"), /* @__PURE__ */ React__default.createElement("p", { className: "font-medium text-textPrimary" }, selectedSlot)), /* @__PURE__ */ React__default.createElement(Clock, { className: "w-5 h-5 text-primary" })))), error && /* @__PURE__ */ React__default.createElement("p", { className: "text-red-500 text-sm text-center" }, error));
}

const Input = React.forwardRef(
  ({ className, type, ...props }, ref) => {
    return /* @__PURE__ */ React.createElement(
      "input",
      {
        type,
        className: cn(
          "w-full rounded-xl border border-border bg-white px-3 py-2 text-textPrimary placeholder:text-textSecondary/60 focus:border-gold focus:ring-2 focus:ring-gold/40 outline-none transition disabled:cursor-not-allowed disabled:opacity-50",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Input.displayName = "Input";

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-textPrimary"
);
const Label = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ React.createElement(
  LabelPrimitive.Root,
  {
    ref,
    className: cn(labelVariants(), className),
    ...props
  }
));
Label.displayName = LabelPrimitive.Root.displayName;

const Textarea = React.forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ React.createElement(
      "textarea",
      {
        className: cn(
          "w-full rounded-xl border border-border bg-white px-3 py-2 text-textPrimary placeholder:text-textSecondary/60 focus:border-gold focus:ring-2 focus:ring-gold/40 outline-none transition disabled:cursor-not-allowed disabled:opacity-50 resize-vertical min-h-[80px]",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Textarea.displayName = "Textarea";

const Checkbox = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ React.createElement(
  CheckboxPrimitive.Root,
  {
    ref,
    className: cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-border ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-white",
      className
    ),
    ...props
  },
  /* @__PURE__ */ React.createElement(
    CheckboxPrimitive.Indicator,
    {
      className: cn("flex items-center justify-center text-current")
    },
    /* @__PURE__ */ React.createElement(Check, { className: "h-4 w-4" })
  )
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

const alertVariants = cva(
  "relative w-full rounded-xl border p-4",
  {
    variants: {
      variant: {
        default: "bg-background text-textPrimary border-border",
        destructive: "border-red-500/50 text-red-500 [&>svg]:text-red-500",
        warning: "border-yellow-500/50 text-yellow-600 [&>svg]:text-yellow-600",
        success: "border-green-500/50 text-green-600 [&>svg]:text-green-600"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
const Alert = React.forwardRef(({ className, variant, ...props }, ref) => /* @__PURE__ */ React.createElement(
  "div",
  {
    ref,
    role: "alert",
    className: cn(alertVariants({ variant }), className),
    ...props
  }
));
Alert.displayName = "Alert";
const AlertTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ React.createElement(
  "h5",
  {
    ref,
    className: cn("mb-1 font-medium leading-none tracking-tight", className),
    ...props
  }
));
AlertTitle.displayName = "AlertTitle";
const AlertDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ React.createElement(
  "div",
  {
    ref,
    className: cn("text-sm [&_p]:leading-relaxed", className),
    ...props
  }
));
AlertDescription.displayName = "AlertDescription";

function BookingForm({ onSuccess, onError }) {
  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [selectedService, setSelectedService] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    getValues
  } = useForm({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      date: format(addDays(/* @__PURE__ */ new Date(), 1), "yyyy-MM-dd"),
      // Tomorrow as default
      gdprConsent: false
    }
  });
  const handleFormSubmit = handleSubmit((data) => {
    console.log("handleSubmit called with data:", data);
    onSubmit(data);
  });
  const watchedServiceId = watch("serviceId");
  const watchedDate = watch("date");
  useEffect(() => {
    loadServices();
  }, []);
  useEffect(() => {
    if (watchedServiceId && watchedDate) {
      loadAvailableSlots(watchedServiceId, watchedDate);
    }
  }, [watchedServiceId, watchedDate]);
  const loadServices = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/services");
      if (response.ok) {
        const data = await response.json();
        setServices(data.data || []);
      } else {
        setError("Greška pri učitavanju usluga");
      }
    } catch (err) {
      setError("Greška pri učitavanju usluga");
    } finally {
      setLoading(false);
    }
  };
  const loadAvailableSlots = async (serviceId, date) => {
    try {
      const response = await fetch("/api/availability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ serviceId, date })
      });
      if (response.ok) {
        const data = await response.json();
        setAvailableSlots(data.data?.slots || []);
        const service = services.find((s) => s.id === serviceId);
        setSelectedService(service || null);
      } else {
        setAvailableSlots([]);
        setError("Greška pri učitavanju dostupnih termina");
      }
    } catch (err) {
      setAvailableSlots([]);
      setError("Greška pri učitavanju dostupnih termina");
    }
  };
  const onSubmit = async (data) => {
    console.log("🚀 onSubmit called with data:", data);
    try {
      setSubmitting(true);
      setError("");
      console.log("Form data on submit:", data);
      const startAt = (/* @__PURE__ */ new Date(`${data.date}T${data.timeSlot}:00`)).toISOString();
      const bookingData = {
        serviceId: data.serviceId,
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        clientPhone: data.clientPhone || void 0,
        startAt,
        notes: data.notes || void 0
      };
      console.log("Booking data being sent:", bookingData);
      const response = await fetch("/api/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(bookingData)
      });
      console.log("Booking response status:", response.status);
      const result = await response.json();
      if (response.ok && result.success) {
        if (onSuccess) {
          onSuccess(result.data.booking.id);
        } else {
          window.location.href = `/rezervacije/uspjeh?booking=${result.data.booking.id}`;
        }
      } else {
        const errorMessage = result.error || "Greška pri kreiranju rezervacije";
        setError(errorMessage);
        if (onError) {
          onError(errorMessage);
        }
        setSubmitting(false);
      }
    } catch (err) {
      const errorMessage = "Greška pri kreiranju rezervacije";
      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
      setSubmitting(false);
    }
  };
  const nextStep = () => {
    const currentData = getValues();
    if (step === 1 && !currentData.serviceId) {
      setError("Molimo odaberite uslugu");
      return;
    }
    if (step === 2 && !currentData.date) {
      setError("Molimo odaberite datum");
      return;
    }
    if (step === 3 && !currentData.timeSlot) {
      setError("Molimo odaberite vrijeme");
      return;
    }
    setError("");
    setStep(step + 1);
  };
  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
      setError("");
    }
  };
  const steps = [
    { number: 1, title: "Usluga", icon: Calendar },
    { number: 2, title: "Datum", icon: Calendar },
    { number: 3, title: "Vrijeme", icon: Clock },
    { number: 4, title: "Podaci", icon: User }
  ];
  return /* @__PURE__ */ React__default.createElement("div", { className: "max-w-2xl mx-auto p-4" }, /* @__PURE__ */ React__default.createElement("div", { className: "mb-8" }, /* @__PURE__ */ React__default.createElement("div", { className: "flex items-center justify-center mb-4" }, steps.map((s, index) => /* @__PURE__ */ React__default.createElement(React__default.Fragment, { key: s.number }, /* @__PURE__ */ React__default.createElement(
    "div",
    {
      className: `flex items-center justify-center w-10 h-10 rounded-full border-2 ${step >= s.number ? "bg-primary border-primary text-white" : "border-border text-textSecondary"}`
    },
    step > s.number ? /* @__PURE__ */ React__default.createElement(CheckCircle, { className: "w-6 h-6" }) : /* @__PURE__ */ React__default.createElement(s.icon, { className: "w-5 h-5" })
  ), index < steps.length - 1 && /* @__PURE__ */ React__default.createElement(
    "div",
    {
      className: `w-12 h-1 mx-2 ${step > s.number ? "bg-primary" : "bg-border"}`
    }
  )))), /* @__PURE__ */ React__default.createElement("p", { className: "text-center text-textSecondary" }, "Korak ", step, " od ", steps.length, ": ", steps[step - 1]?.title)), error && /* @__PURE__ */ React__default.createElement(Alert, { variant: "destructive", className: "mb-6" }, /* @__PURE__ */ React__default.createElement(AlertDescription, null, error)), /* @__PURE__ */ React__default.createElement(Card, null, /* @__PURE__ */ React__default.createElement(CardHeader, null, /* @__PURE__ */ React__default.createElement(CardTitle, { className: "text-center" }, step === 1 && "Odaberite uslugu", step === 2 && "Odaberite datum", step === 3 && "Odaberite vrijeme", step === 4 && "Unesite vaše podatke")), /* @__PURE__ */ React__default.createElement(CardContent, null, /* @__PURE__ */ React__default.createElement("form", { onSubmit: handleFormSubmit }, step === 1 && /* @__PURE__ */ React__default.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ React__default.createElement(
    ServiceSelect,
    {
      services,
      loading,
      onSelect: (serviceId) => setValue("serviceId", serviceId),
      error: errors.serviceId?.message,
      selectedServiceId: watchedServiceId
    }
  ), /* @__PURE__ */ React__default.createElement("div", { className: "flex justify-end" }, /* @__PURE__ */ React__default.createElement(
    Button,
    {
      type: "button",
      onClick: nextStep,
      disabled: !watchedServiceId
    },
    "Sljedeći korak"
  ))), step === 2 && /* @__PURE__ */ React__default.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ React__default.createElement(
    DatePicker,
    {
      value: watchedDate,
      onChange: (date) => setValue("date", date),
      error: errors.date?.message
    }
  ), /* @__PURE__ */ React__default.createElement("div", { className: "flex justify-between" }, /* @__PURE__ */ React__default.createElement(Button, { type: "button", variant: "outline", onClick: prevStep }, "Nazad"), /* @__PURE__ */ React__default.createElement(
    Button,
    {
      type: "button",
      onClick: nextStep,
      disabled: !watchedDate
    },
    "Sljedeći korak"
  ))), step === 3 && /* @__PURE__ */ React__default.createElement("div", { className: "space-y-4" }, selectedService && /* @__PURE__ */ React__default.createElement("div", { className: "text-center mb-4" }, /* @__PURE__ */ React__default.createElement("h3", { className: "text-lg font-medium" }, selectedService.name), /* @__PURE__ */ React__default.createElement("p", { className: "text-textSecondary" }, "Trajanje: ", selectedService.duration, " min", selectedService.price && ` • Cijena: ${selectedService.price}€`)), /* @__PURE__ */ React__default.createElement(
    SlotPicker,
    {
      slots: availableSlots,
      onSelect: (time) => setValue("timeSlot", time),
      error: errors.timeSlot?.message,
      selectedTime: watch("timeSlot")
    }
  ), /* @__PURE__ */ React__default.createElement("div", { className: "flex justify-between" }, /* @__PURE__ */ React__default.createElement(Button, { type: "button", variant: "outline", onClick: prevStep }, "Nazad"), /* @__PURE__ */ React__default.createElement(
    Button,
    {
      type: "button",
      onClick: nextStep,
      disabled: !watch("timeSlot")
    },
    "Sljedeći korak"
  ))), step === 4 && /* @__PURE__ */ React__default.createElement("div", { className: "space-y-6" }, /* @__PURE__ */ React__default.createElement("div", { className: "bg-surface p-4 rounded-lg" }, /* @__PURE__ */ React__default.createElement("h3", { className: "font-medium mb-2" }, "Sažetak rezervacije"), /* @__PURE__ */ React__default.createElement("div", { className: "text-sm text-textSecondary space-y-1" }, /* @__PURE__ */ React__default.createElement("p", null, /* @__PURE__ */ React__default.createElement("strong", null, "Usluga:"), " ", selectedService?.name), /* @__PURE__ */ React__default.createElement("p", null, /* @__PURE__ */ React__default.createElement("strong", null, "Datum:"), " ", new Date(watchedDate).toLocaleDateString("hr-HR")), /* @__PURE__ */ React__default.createElement("p", null, /* @__PURE__ */ React__default.createElement("strong", null, "Vrijeme:"), " ", watch("timeSlot")), /* @__PURE__ */ React__default.createElement("p", null, /* @__PURE__ */ React__default.createElement("strong", null, "Trajanje:"), " ", selectedService?.duration, " min"))), /* @__PURE__ */ React__default.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" }, /* @__PURE__ */ React__default.createElement("div", null, /* @__PURE__ */ React__default.createElement(Label, { htmlFor: "clientName" }, /* @__PURE__ */ React__default.createElement(User, { className: "w-4 h-4 inline mr-2" }), "Ime i prezime *"), /* @__PURE__ */ React__default.createElement(
    Input,
    {
      id: "clientName",
      ...register("clientName"),
      placeholder: "Vaše ime i prezime",
      className: errors.clientName ? "border-red-500" : ""
    }
  ), errors.clientName && /* @__PURE__ */ React__default.createElement("p", { className: "text-red-500 text-sm mt-1" }, errors.clientName.message)), /* @__PURE__ */ React__default.createElement("div", null, /* @__PURE__ */ React__default.createElement(Label, { htmlFor: "clientEmail" }, /* @__PURE__ */ React__default.createElement(Mail, { className: "w-4 h-4 inline mr-2" }), "Email adresa *"), /* @__PURE__ */ React__default.createElement(
    Input,
    {
      id: "clientEmail",
      type: "email",
      ...register("clientEmail"),
      placeholder: "vas@email.com",
      className: errors.clientEmail ? "border-red-500" : ""
    }
  ), errors.clientEmail && /* @__PURE__ */ React__default.createElement("p", { className: "text-red-500 text-sm mt-1" }, errors.clientEmail.message)), /* @__PURE__ */ React__default.createElement("div", { className: "md:col-span-2" }, /* @__PURE__ */ React__default.createElement(Label, { htmlFor: "clientPhone" }, /* @__PURE__ */ React__default.createElement(Phone, { className: "w-4 h-4 inline mr-2" }), "Broj telefona"), /* @__PURE__ */ React__default.createElement(
    Input,
    {
      id: "clientPhone",
      ...register("clientPhone"),
      placeholder: "+385 99 123 4567",
      className: errors.clientPhone ? "border-red-500" : ""
    }
  ), errors.clientPhone && /* @__PURE__ */ React__default.createElement("p", { className: "text-red-500 text-sm mt-1" }, errors.clientPhone.message)), /* @__PURE__ */ React__default.createElement("div", { className: "md:col-span-2" }, /* @__PURE__ */ React__default.createElement(Label, { htmlFor: "notes" }, /* @__PURE__ */ React__default.createElement(MessageSquare, { className: "w-4 h-4 inline mr-2" }), "Napomena (opcionalno)"), /* @__PURE__ */ React__default.createElement(
    Textarea,
    {
      id: "notes",
      ...register("notes"),
      placeholder: "Dodatne napomene...",
      rows: 3,
      className: errors.notes ? "border-red-500" : ""
    }
  ), errors.notes && /* @__PURE__ */ React__default.createElement("p", { className: "text-red-500 text-sm mt-1" }, errors.notes.message))), /* @__PURE__ */ React__default.createElement("div", { className: "flex items-start space-x-2" }, /* @__PURE__ */ React__default.createElement(
    Checkbox,
    {
      id: "gdprConsent",
      checked: watch("gdprConsent"),
      onCheckedChange: (checked) => setValue("gdprConsent", !!checked),
      className: errors.gdprConsent ? "border-red-500" : ""
    }
  ), /* @__PURE__ */ React__default.createElement(Label, { htmlFor: "gdprConsent", className: "text-sm leading-5" }, "Prihvaćam uvjete korištenja i pravila privatnosti. Slanjem ovog formulara pristajete na korištenje vaših podataka za potrebe rezervacije. *")), errors.gdprConsent && /* @__PURE__ */ React__default.createElement("p", { className: "text-red-500 text-sm" }, errors.gdprConsent.message), /* @__PURE__ */ React__default.createElement("div", { className: "flex justify-between" }, /* @__PURE__ */ React__default.createElement(Button, { type: "button", variant: "outline", onClick: prevStep }, "Nazad"), /* @__PURE__ */ React__default.createElement(
    Button,
    {
      type: "submit",
      disabled: submitting,
      className: "min-w-[120px]",
      onClick: () => {
        console.log("Submit button clicked");
        console.log("Current form values:", JSON.stringify(getValues(), null, 2));
        console.log("Form errors:", JSON.stringify(errors, null, 2));
        console.log("Form is valid:", Object.keys(errors).length === 0);
      }
    },
    submitting ? /* @__PURE__ */ React__default.createElement(React__default.Fragment, null, /* @__PURE__ */ React__default.createElement(Loader2, { className: "w-4 h-4 mr-2 animate-spin" }), "Rezerviram...") : "Potvrdi rezervaciju"
  )))))));
}

const $$Rezervacije = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, {}, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Header", $$Header, {})} ${maybeRenderHead()}<main class="min-h-screen bg-background"> <div class="container-wide py-16"> <!-- Header --> <div class="text-center mb-12"> <h1 class="section-title mb-4">
Rezerviraj termin
</h1> <p class="text-lg text-textSecondary max-w-2xl mx-auto">
Odaberite uslugu, datum i vrijeme koje vam najbolje odgovara. 
          Potvrdimo će vam rezervaciju putem emaila.
</p> </div> <!-- Booking Form --> <div class="max-w-4xl mx-auto"> ${renderComponent($$result2, "BookingForm", BookingForm, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/orisnik/projects/beauty-house-marijana/src/components/booking/BookingForm", "client:component-export": "BookingForm" })} </div> <!-- Info Section --> <div class="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"> <div class="card p-6 text-center"> <div class="text-3xl mb-3">📅</div> <h3 class="font-semibold text-textPrimary mb-2">Fleksibilno rezerviranje</h3> <p class="text-textSecondary text-sm">
Rezervirajte termin do 30 dana unaprijed
</p> </div> <div class="card p-6 text-center"> <div class="text-3xl mb-3">📧</div> <h3 class="font-semibold text-textPrimary mb-2">Email potvrda</h3> <p class="text-textSecondary text-sm">
Dobit ćete potvrdu rezervacije na email
</p> </div> <div class="card p-6 text-center"> <div class="text-3xl mb-3">🔄</div> <h3 class="font-semibold text-textPrimary mb-2">Možete otkazati</h3> <p class="text-textSecondary text-sm">
Besplatno otkazivanje do 24h prije termina
</p> </div> </div> <!-- Contact Info --> <div class="mt-16 text-center"> <div class="card p-6 max-w-md mx-auto"> <h3 class="font-semibold text-textPrimary mb-4">Trebate pomoć?</h3> <div class="space-y-2 text-textSecondary"> <p>📞 +385 31 280 678</p> <p>📧 info@beautyhouse.hr</p> <p class="text-sm">Pon-Pet: 08:00-20:00, Sub: 08:00-14:00</p> </div> </div> </div> </div> </main> ${renderComponent($$result2, "Footer", $$Footer, {})} ` })}`;
}, "/home/orisnik/projects/beauty-house-marijana/src/pages/rezervacije.astro", void 0);

const $$file = "/home/orisnik/projects/beauty-house-marijana/src/pages/rezervacije.astro";
const $$url = "/rezervacije";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Rezervacije,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
