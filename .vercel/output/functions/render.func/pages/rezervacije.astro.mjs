/* empty css                                 */
import { e as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_BpigWmc2.mjs';
import 'kleur/colors';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_P_euJCoa.mjs';
import { $ as $$Header, a as $$Footer } from '../chunks/Footer_Duua4RXW.mjs';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import * as React from 'react';
import React__default, { useState, useEffect } from 'react';
import { c as cn, B as Button } from '../chunks/card_Gl3AMm-5.mjs';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cva } from 'class-variance-authority';
import { ChevronLeft, Loader2, ChevronRight, X, CheckCircle } from 'lucide-react';
export { renderers } from '../renderers.mjs';

const Input = React.forwardRef(
  ({ className, type, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
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
const Label = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
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
    return /* @__PURE__ */ jsx(
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
const Alert = React.forwardRef(({ className, variant, ...props }, ref) => /* @__PURE__ */ jsx(
  "div",
  {
    ref,
    role: "alert",
    className: cn(alertVariants({ variant }), className),
    ...props
  }
));
Alert.displayName = "Alert";
const AlertTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "h5",
  {
    ref,
    className: cn("mb-1 font-medium leading-none tracking-tight", className),
    ...props
  }
));
AlertTitle.displayName = "AlertTitle";
const AlertDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "div",
  {
    ref,
    className: cn("text-sm [&_p]:leading-relaxed", className),
    ...props
  }
));
AlertDescription.displayName = "AlertDescription";

function BookingForm({ onSuccess, onError }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [bookingState, setBookingState] = useState({
    selectedService: null,
    selectedStaff: null,
    selectedDate: "",
    selectedTime: "",
    availableSlots: [],
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    notes: "",
    bookingId: ""
  });
  useEffect(() => {
    loadInitialData();
    const bookingRoot = document.getElementById("booking-root");
    if (bookingRoot) {
      bookingRoot.scrollIntoView({ behavior: "smooth" });
    }
  }, []);
  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [servicesRes, staffRes] = await Promise.all([
        fetch("/api/services"),
        fetch("/api/staff")
      ]);
      if (servicesRes.ok) {
        const servicesData = await servicesRes.json();
        setServices(servicesData.data || []);
      }
      if (staffRes.ok) {
        const staffData = await staffRes.json();
        setStaff(staffData.data || []);
      }
    } catch (err) {
      setError("Greška pri učitavanju podataka");
    } finally {
      setLoading(false);
    }
  };
  const loadAvailableSlots = async (serviceId, staffId, date) => {
    try {
      setLoading(true);
      const response = await fetch("/api/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId, staffId, date })
      });
      if (response.ok) {
        const data = await response.json();
        setBookingState((prev) => ({
          ...prev,
          availableSlots: data.data?.slots || []
        }));
      } else {
        setError("Greška pri učitavanju dostupnih termina");
        setBookingState((prev) => ({ ...prev, availableSlots: [] }));
      }
    } catch (err) {
      setError("Greška pri učitavanju dostupnih termina");
      setBookingState((prev) => ({ ...prev, availableSlots: [] }));
    } finally {
      setLoading(false);
    }
  };
  const validateAndNextStep = () => {
    setError("");
    if (currentStep === 4) {
      if (!bookingState.clientName || !bookingState.clientEmail) {
        setError("Molimo unesite ime i email");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bookingState.clientEmail)) {
        setError("Molimo unesite valjan email");
        return;
      }
    }
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError("");
    }
  };
  const submitBooking = async () => {
    try {
      setSubmitting(true);
      setError("");
      const startAt = (/* @__PURE__ */ new Date(`${bookingState.selectedDate}T${bookingState.selectedTime}:00`)).toISOString();
      const bookingData = {
        serviceId: bookingState.selectedService.id,
        staffId: bookingState.selectedStaff.id,
        clientName: bookingState.clientName,
        clientEmail: bookingState.clientEmail,
        clientPhone: bookingState.clientPhone || void 0,
        startAt,
        notes: bookingState.notes || void 0
      };
      const response = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData)
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setBookingState((prev) => ({ ...prev, bookingId: result.data.booking.id }));
        setCurrentStep(5);
        if (onSuccess) {
          onSuccess(result.data.booking.id);
        }
      } else {
        const errorMessage = result.error || "Greška pri kreiranju rezervacije";
        setError(errorMessage);
        if (onError) {
          onError(errorMessage);
        }
      }
    } catch (err) {
      const errorMessage = "Greška pri kreiranju rezervacije";
      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };
  const steps = [
    { number: 1, title: "Odaberi uslugu" },
    { number: 2, title: "Odaberi djelatnika" },
    { number: 3, title: "Odaberi datum i vrijeme" },
    { number: 4, title: "Informacije o kupcu" },
    { number: 5, title: "Potvrda narudžbe" }
  ];
  const showSummary = bookingState.selectedService !== null;
  return /* @__PURE__ */ jsx("div", { className: "w-full max-w-6xl mx-auto pt-20", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden", children: [
    /* @__PURE__ */ jsx("div", { className: "bg-gray-50 px-6 py-4 border-b border-gray-200", children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center space-x-2", children: steps.map((step, index) => /* @__PURE__ */ jsxs(React__default.Fragment, { children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          className: `w-2 h-2 rounded-full ${currentStep >= step.number ? "bg-primary" : "bg-gray-300"}`
        }
      ),
      index < steps.length - 1 && /* @__PURE__ */ jsx("div", { className: "w-4 h-0.5 bg-gray-300" })
    ] }, step.number)) }) }),
    error && /* @__PURE__ */ jsx("div", { className: "px-6 py-3", children: /* @__PURE__ */ jsx(Alert, { variant: "destructive", children: /* @__PURE__ */ jsx(AlertDescription, { children: error }) }) }),
    /* @__PURE__ */ jsxs("div", { className: `grid grid-cols-1 gap-0 ${showSummary ? "lg:grid-cols-3" : ""}`, children: [
      /* @__PURE__ */ jsx("div", { className: showSummary ? "lg:col-span-2" : "", children: /* @__PURE__ */ jsxs("div", { className: "p-6", style: { maxHeight: "800px", minHeight: "500px" }, children: [
        currentStep === 1 && /* @__PURE__ */ jsx(
          ServiceStep,
          {
            services,
            loading,
            selectedService: bookingState.selectedService,
            onServiceSelect: (service) => {
              setBookingState((prev) => ({ ...prev, selectedService: service }));
              setTimeout(() => {
                setCurrentStep(2);
                setError("");
              }, 100);
            }
          }
        ),
        currentStep === 2 && /* @__PURE__ */ jsx(
          StaffStep,
          {
            staff,
            selectedStaff: bookingState.selectedStaff,
            onStaffSelect: (staff2) => {
              setBookingState((prev) => ({ ...prev, selectedStaff: staff2 }));
              setTimeout(() => {
                setCurrentStep(3);
                setError("");
              }, 100);
            }
          }
        ),
        currentStep === 3 && /* @__PURE__ */ jsx(
          DateTimeStep,
          {
            selectedDate: bookingState.selectedDate,
            selectedTime: bookingState.selectedTime,
            availableSlots: bookingState.availableSlots,
            loading,
            onDateSelect: (date) => {
              setBookingState((prev) => ({ ...prev, selectedDate: date, selectedTime: "" }));
              if (bookingState.selectedService && bookingState.selectedStaff) {
                loadAvailableSlots(bookingState.selectedService.id, bookingState.selectedStaff.id, date);
              }
            },
            onTimeSelect: (time) => {
              setBookingState((prev) => ({ ...prev, selectedTime: time }));
              setTimeout(() => {
                setCurrentStep(4);
                setError("");
              }, 100);
            }
          }
        ),
        currentStep === 4 && /* @__PURE__ */ jsx(
          CustomerInfoStep,
          {
            clientName: bookingState.clientName,
            clientEmail: bookingState.clientEmail,
            clientPhone: bookingState.clientPhone,
            notes: bookingState.notes,
            onChange: (field, value) => {
              setBookingState((prev) => ({ ...prev, [field]: value }));
            }
          }
        ),
        currentStep === 5 && /* @__PURE__ */ jsx(
          ConfirmationStep,
          {
            bookingState
          }
        ),
        currentStep > 1 && currentStep < 5 && /* @__PURE__ */ jsxs("div", { className: "flex justify-between mt-6 pt-4 border-t", children: [
          /* @__PURE__ */ jsxs(
            Button,
            {
              type: "button",
              variant: "outline",
              onClick: prevStep,
              className: "flex items-center",
              children: [
                /* @__PURE__ */ jsx(ChevronLeft, { className: "w-4 h-4 mr-2" }),
                "Nazad"
              ]
            }
          ),
          currentStep === 4 ? /* @__PURE__ */ jsx(
            Button,
            {
              type: "button",
              onClick: submitBooking,
              disabled: submitting || !bookingState.clientName || !bookingState.clientEmail,
              className: "flex items-center",
              children: submitting ? /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(Loader2, { className: "w-4 h-4 mr-2 animate-spin" }),
                "Rezerviram..."
              ] }) : "Potvrdi rezervaciju"
            }
          ) : currentStep === 3 ? /* @__PURE__ */ jsxs(
            Button,
            {
              type: "button",
              onClick: validateAndNextStep,
              disabled: !bookingState.selectedDate || !bookingState.selectedTime,
              className: "flex items-center",
              children: [
                "Dalje",
                /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4 ml-2" })
              ]
            }
          ) : null
        ] }),
        currentStep === 5 && /* @__PURE__ */ jsxs("div", { className: "flex justify-center space-x-3 mt-6 pt-4 border-t", children: [
          /* @__PURE__ */ jsx(
            Button,
            {
              type: "button",
              variant: "outline",
              onClick: () => window.location.href = "/",
              children: "Povratak na početnu"
            }
          ),
          /* @__PURE__ */ jsx(
            Button,
            {
              type: "button",
              onClick: () => {
                setCurrentStep(1);
                setBookingState({
                  selectedService: null,
                  selectedStaff: null,
                  selectedDate: "",
                  selectedTime: "",
                  availableSlots: [],
                  clientName: "",
                  clientEmail: "",
                  clientPhone: "",
                  notes: "",
                  bookingId: ""
                });
              },
              children: "Nova rezervacija"
            }
          )
        ] })
      ] }) }),
      showSummary && /* @__PURE__ */ jsx("div", { className: "hidden lg:block border-l border-gray-200", children: /* @__PURE__ */ jsx(SummaryPanel, { bookingState }) })
    ] }),
    showSummary && /* @__PURE__ */ jsx("div", { className: "lg:hidden border-t border-gray-200", children: /* @__PURE__ */ jsx(SummaryPanel, { bookingState }) })
  ] }) });
}
function ServiceStep({ services, loading, selectedService, onServiceSelect }) {
  if (loading) {
    return /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center py-8", children: [
      /* @__PURE__ */ jsx(Loader2, { className: "w-5 h-5 animate-spin" }),
      /* @__PURE__ */ jsx("span", { className: "ml-2 text-sm", children: "Učitavam usluge..." })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "h-full flex flex-col", children: [
    /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold mb-4", children: "Odaberite uslugu" }),
    /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto", style: { maxHeight: "550px" }, children: /* @__PURE__ */ jsx("div", { className: "space-y-2 pr-2", children: services.map((service) => /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => onServiceSelect(service),
        className: `w-full p-4 text-left border rounded-lg transition-colors ${selectedService?.id === service.id ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300"}`,
        children: /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsx("h3", { className: "font-medium", children: service.name }),
            service.description && /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 mt-1 line-clamp-2", children: service.description }),
            /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-500 mt-1", children: [
              "Trajanje: ",
              service.duration,
              " min"
            ] })
          ] }),
          service.price && /* @__PURE__ */ jsxs("div", { className: "text-lg font-semibold text-primary ml-3", children: [
            service.price,
            "€"
          ] })
        ] })
      },
      service.id
    )) }) })
  ] });
}
function StaffStep({ staff, selectedStaff, onStaffSelect }) {
  return /* @__PURE__ */ jsxs("div", { className: "h-full flex flex-col", children: [
    /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold mb-4", children: "Odaberite djelatnika" }),
    /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto", style: { maxHeight: "550px" }, children: /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-4", children: staff.map((member) => /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => onStaffSelect(member),
        className: `p-4 text-center border rounded-lg transition-colors ${selectedStaff?.id === member.id ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300"}`,
        children: [
          /* @__PURE__ */ jsx("div", { className: "mb-3", children: /* @__PURE__ */ jsx(
            "img",
            {
              src: member.avatar,
              alt: member.name,
              className: "w-16 h-16 rounded-full mx-auto object-cover"
            }
          ) }),
          /* @__PURE__ */ jsx("h3", { className: "font-medium text-sm", children: member.name }),
          member.description && /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-600 mt-1 line-clamp-1", children: member.description })
        ]
      },
      member.id
    )) }) })
  ] });
}
function DateTimeStep({
  selectedDate,
  selectedTime,
  availableSlots,
  loading,
  onDateSelect,
  onTimeSelect
}) {
  const [currentMonth, setCurrentMonth] = useState(/* @__PURE__ */ new Date());
  const [unavailableMessage, setUnavailableMessage] = useState("");
  const generateCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    const dayOfWeek = firstDay.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startDate.setDate(firstDay.getDate() - daysToSubtract);
    const weeks = [];
    const currentDate = new Date(startDate);
    for (let week = 0; week < 6; week++) {
      const weekDays = [];
      let hasCurrentMonthDay = false;
      for (let day = 0; day < 7; day++) {
        const date = new Date(currentDate);
        weekDays.push(date);
        if (date.getMonth() === month) {
          hasCurrentMonthDay = true;
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
      if (hasCurrentMonthDay) {
        weeks.push(weekDays);
      }
    }
    return weeks.flat();
  };
  const calendar = generateCalendar();
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  const isDateAvailable = (date) => {
    if (date.getDay() === 0) return false;
    if (date < today) return false;
    return true;
  };
  const handleDateClick = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    if (!isDateAvailable(date)) {
      if (date.getDay() === 0) {
        setUnavailableMessage("Nedjelja je neradni dan.");
      } else if (date < today) {
        setUnavailableMessage("Ne možete rezervirati termin u prošlosti.");
      } else {
        setUnavailableMessage("Nema dostupnih termina za odabrani datum.");
      }
      setTimeout(() => setUnavailableMessage(""), 3e3);
      return;
    }
    setUnavailableMessage("");
    onDateSelect(dateStr);
  };
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };
  const prevMonth = () => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1);
    if (newMonth.getMonth() >= (/* @__PURE__ */ new Date()).getMonth() || newMonth.getFullYear() > (/* @__PURE__ */ new Date()).getFullYear()) {
      setCurrentMonth(newMonth);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "h-full flex flex-col", children: [
    /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold mb-4", children: "Odaberite datum i vrijeme" }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-y-auto", style: { maxHeight: "550px" }, children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-3 bg-gradient-to-r from-blue-50 to-purple-50 p-2 rounded-lg", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: prevMonth,
            className: "p-1.5 rounded-full hover:bg-white/50 transition-colors",
            children: /* @__PURE__ */ jsx(ChevronLeft, { className: "w-4 h-4 text-gray-600" })
          }
        ),
        /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold text-gray-800", children: currentMonth.toLocaleDateString("hr-HR", { month: "long", year: "numeric" }) }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: nextMonth,
            className: "p-1.5 rounded-full hover:bg-white/50 transition-colors",
            children: /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4 text-gray-600" })
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-7 gap-1 mb-1", children: ["PON", "UTO", "SRI", "ČET", "PET", "SUB", "NED"].map((day) => /* @__PURE__ */ jsx("div", { className: "text-center text-xs font-medium text-gray-500 py-1", children: day }, day)) }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-7 gap-1 mb-4", children: calendar.map((date, index) => {
        const dateStr = date.toISOString().split("T")[0];
        const isSelected = selectedDate === dateStr;
        const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
        const isAvailable = isDateAvailable(date);
        const isSunday = date.getDay() === 0;
        return /* @__PURE__ */ jsx("div", { className: "relative", children: /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => handleDateClick(date),
            className: `
                    w-full h-8 text-xs rounded-md transition-all duration-200 relative flex items-center justify-center
                    ${!isCurrentMonth ? "text-gray-300 cursor-default" : isSelected ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md font-medium" : isAvailable ? "bg-gradient-to-br from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 text-gray-800 border border-blue-200 hover:border-blue-300 hover:shadow-sm" : isSunday ? "bg-red-50 text-red-300 cursor-not-allowed" : "bg-gray-100 text-gray-400 cursor-not-allowed hover:bg-red-50"}
                  `,
            disabled: !isCurrentMonth,
            children: [
              /* @__PURE__ */ jsx("span", { children: date.getDate() }),
              isCurrentMonth && !isAvailable && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity", children: /* @__PURE__ */ jsx("div", { className: "w-4 h-4 bg-red-500 rounded-full flex items-center justify-center", children: /* @__PURE__ */ jsx(X, { className: "w-3 h-3 text-white" }) }) }),
              isCurrentMonth && isAvailable && !isSelected && /* @__PURE__ */ jsx("div", { className: "absolute bottom-0.5 right-0.5 w-1.5 h-1.5 bg-green-400 rounded-full" })
            ]
          }
        ) }, index);
      }) }),
      unavailableMessage && /* @__PURE__ */ jsx("div", { className: "mb-4 p-3 bg-red-50 border border-red-200 rounded-lg", children: /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600 text-center", children: unavailableMessage }) }),
      selectedDate && /* @__PURE__ */ jsxs("div", { className: "border-t pt-3", children: [
        /* @__PURE__ */ jsxs("h3", { className: "text-sm font-medium mb-2 text-center bg-gradient-to-r from-green-100 to-teal-100 p-2 rounded-md", children: [
          "Dostupni termini za ",
          (/* @__PURE__ */ new Date(selectedDate + "T00:00:00")).toLocaleDateString("hr-HR", {
            weekday: "long",
            day: "numeric",
            month: "long"
          })
        ] }),
        loading ? /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center py-4", children: [
          /* @__PURE__ */ jsx(Loader2, { className: "w-4 h-4 animate-spin text-blue-500" }),
          /* @__PURE__ */ jsx("span", { className: "ml-2 text-sm text-gray-600", children: "Učitavam termine..." })
        ] }) : availableSlots.filter((slot) => slot.available).length > 0 ? /* @__PURE__ */ jsx("div", { className: "grid grid-cols-4 gap-2", children: availableSlots.filter((slot) => slot.available).map((slot) => /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => onTimeSelect(slot.time),
            className: `
                      p-2 text-xs rounded-md transition-all duration-200 font-medium
                      ${selectedTime === slot.time ? "bg-gradient-to-br from-green-500 to-teal-600 text-white shadow-md" : "bg-gradient-to-br from-green-50 to-teal-50 hover:from-green-100 hover:to-teal-100 text-gray-800 border border-green-200 hover:border-green-300 hover:shadow-sm"}
                    `,
            children: slot.time
          },
          slot.time
        )) }) : /* @__PURE__ */ jsxs("div", { className: "text-center py-4", children: [
          /* @__PURE__ */ jsx("div", { className: "w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2", children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4 text-gray-400" }) }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-sm", children: "Nema dostupnih termina za odabrani datum." })
        ] })
      ] })
    ] })
  ] });
}
function CustomerInfoStep({
  clientName,
  clientEmail,
  clientPhone,
  notes,
  onChange
}) {
  return /* @__PURE__ */ jsxs("div", { className: "h-full flex flex-col", children: [
    /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold mb-4", children: "Unesite vaše podatke" }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-y-auto space-y-4", style: { maxHeight: "550px" }, children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "clientName", children: "Ime i prezime *" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "clientName",
              value: clientName,
              onChange: (e) => onChange("clientName", e.target.value),
              placeholder: "Vaše ime i prezime",
              required: true
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "clientEmail", children: "Email adresa *" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "clientEmail",
              type: "email",
              value: clientEmail,
              onChange: (e) => onChange("clientEmail", e.target.value),
              placeholder: "vas@email.com",
              required: true
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "clientPhone", children: "Broj telefona" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            id: "clientPhone",
            value: clientPhone,
            onChange: (e) => onChange("clientPhone", e.target.value),
            placeholder: "+385 99 123 4567"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "notes", children: "Napomena (opcionalno)" }),
        /* @__PURE__ */ jsx(
          Textarea,
          {
            id: "notes",
            value: notes,
            onChange: (e) => onChange("notes", e.target.value),
            placeholder: "Dodatne napomene...",
            rows: 3
          }
        )
      ] })
    ] })
  ] });
}
function ConfirmationStep({ bookingState }) {
  const generateBookingNumber = () => {
    return `BH${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  };
  return /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsx(CheckCircle, { className: "w-16 h-16 text-green-500 mx-auto mb-4" }),
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-semibold text-green-600 mb-2", children: "Rezervacija uspješno kreirana!" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-600", children: "Vaša rezervacija je potvrđena. Dobit ćete email potvrdu uskoro." })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 p-6 rounded-lg text-left max-w-md mx-auto", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-semibold mb-4 text-center", children: "Detalji rezervacije" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-sm", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Broj rezervacije:" }),
          /* @__PURE__ */ jsx("span", { className: "font-medium", children: generateBookingNumber() })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Usluga:" }),
          /* @__PURE__ */ jsx("span", { className: "font-medium", children: bookingState.selectedService?.name })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Djelatnik:" }),
          /* @__PURE__ */ jsx("span", { className: "font-medium", children: bookingState.selectedStaff?.name })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Datum:" }),
          /* @__PURE__ */ jsx("span", { className: "font-medium", children: new Date(bookingState.selectedDate).toLocaleDateString("hr-HR") })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Vrijeme:" }),
          /* @__PURE__ */ jsx("span", { className: "font-medium", children: bookingState.selectedTime })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Kupac:" }),
          /* @__PURE__ */ jsx("span", { className: "font-medium", children: bookingState.clientName })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Email:" }),
          /* @__PURE__ */ jsx("span", { className: "font-medium", children: bookingState.clientEmail })
        ] }),
        bookingState.selectedService?.price && /* @__PURE__ */ jsxs("div", { className: "flex justify-between border-t pt-3", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Cijena:" }),
          /* @__PURE__ */ jsxs("span", { className: "font-semibold text-lg", children: [
            bookingState.selectedService.price,
            "€"
          ] })
        ] })
      ] })
    ] })
  ] });
}
function SummaryPanel({ bookingState }) {
  return /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 p-6 h-full", children: [
    /* @__PURE__ */ jsx("h3", { className: "font-semibold mb-4", children: "Sažetak rezervacije" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      bookingState.selectedService ? /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: "font-medium", children: bookingState.selectedService.name }),
        /* @__PURE__ */ jsxs("div", { className: "text-gray-600 text-sm", children: [
          bookingState.selectedService.duration,
          " min"
        ] }),
        bookingState.selectedService.price && /* @__PURE__ */ jsxs("div", { className: "font-semibold text-primary", children: [
          bookingState.selectedService.price,
          "€"
        ] })
      ] }) : /* @__PURE__ */ jsx("div", { className: "text-gray-400", children: "Odaberite uslugu" }),
      /* @__PURE__ */ jsx("hr", { className: "border-gray-200" }),
      bookingState.selectedStaff ? /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-3", children: [
        /* @__PURE__ */ jsx(
          "img",
          {
            src: bookingState.selectedStaff.avatar,
            alt: bookingState.selectedStaff.name,
            className: "w-10 h-10 rounded-full object-cover"
          }
        ),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { className: "font-medium", children: bookingState.selectedStaff.name }),
          /* @__PURE__ */ jsx("div", { className: "text-gray-600 text-sm", children: bookingState.selectedStaff.description })
        ] })
      ] }) : /* @__PURE__ */ jsx("div", { className: "text-gray-400", children: "Odaberite djelatnika" }),
      /* @__PURE__ */ jsx("hr", { className: "border-gray-200" }),
      bookingState.selectedDate ? /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: "font-medium", children: new Date(bookingState.selectedDate).toLocaleDateString("hr-HR", {
          day: "numeric",
          month: "long"
        }) }),
        bookingState.selectedTime && /* @__PURE__ */ jsxs("div", { className: "text-gray-600", children: [
          "u ",
          bookingState.selectedTime
        ] })
      ] }) : /* @__PURE__ */ jsx("div", { className: "text-gray-400", children: "Odaberite datum i vrijeme" }),
      bookingState.clientName && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("hr", { className: "border-gray-200" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { className: "font-medium", children: bookingState.clientName }),
          /* @__PURE__ */ jsx("div", { className: "text-gray-600", children: bookingState.clientEmail }),
          bookingState.clientPhone && /* @__PURE__ */ jsx("div", { className: "text-gray-600", children: bookingState.clientPhone })
        ] })
      ] }),
      bookingState.selectedService?.price && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("hr", { className: "border-gray-200" }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center font-semibold text-lg", children: [
          /* @__PURE__ */ jsx("span", { children: "Ukupno:" }),
          /* @__PURE__ */ jsxs("span", { className: "text-primary", children: [
            bookingState.selectedService.price,
            "€"
          ] })
        ] })
      ] })
    ] })
  ] });
}

const $$Rezervacije = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, {}, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Header", $$Header, {})} ${maybeRenderHead()}<main class="min-h-screen bg-background"> <div class="container-wide py-8"> <!-- Booking Form - No header, direct to booking --> <div id="booking-root" class="w-full"> ${renderComponent($$result2, "BookingForm", BookingForm, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/orisnik/projects/beauty-house-marijana/src/components/booking/BookingForm", "client:component-export": "BookingForm" })} </div> </div> </main> ${renderComponent($$result2, "Footer", $$Footer, {})} ` })}`;
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
