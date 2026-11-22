import React, { useState } from "react";
import { Copy, Check, CreditCard, Building2, Smartphone, User } from "lucide-react";
import { useLanguage } from "@/lib/language";

interface PaymentAccountsProps {
  compact?: boolean;
  className?: string;
  cbeAccount?: string | null;
  abyssiniaAccount?: string | null;
  telebirrAccount?: string | null;
  accountHolder?: string | null;
}

export function PaymentAccounts({
  compact = false,
  className = "",
  cbeAccount,
  abyssiniaAccount,
  telebirrAccount,
  accountHolder: customHolder,
}: PaymentAccountsProps) {
  const { language } = useLanguage();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (key: string, text: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text);
      } else {
        const input = document.createElement("input");
        input.value = text;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
      }
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (e) {
      console.warn("Copy failed", e);
    }
  };

  const accountOwner = {
    label: language === "en" ? "Account Holder" : language === "or" ? "Abbaa Herregaa" : "የአካውንቱ ባለቤት",
    name: customHolder?.trim() || "ካሌብ መስፍን (Kaleb Mesfin)",
  };

  const hasCustomAccounts =
    cbeAccount !== undefined ||
    abyssiniaAccount !== undefined ||
    telebirrAccount !== undefined;

  const accounts: Array<{
    id: string;
    bankName: string;
    shortName: string;
    accountNumber: string;
    icon: any;
    badgeColor: string;
    accentBg: string;
  }> = [];

  // CBE is always included
  accounts.push({
    id: "cbe",
    bankName:
      language === "en"
        ? "Commercial Bank of Ethiopia (CBE)"
        : language === "or"
        ? "Baankii Daldala Itoophiyaa (CBE)"
        : "ኢትዮጵያ ንግድ ባንክ",
    shortName: language === "en" ? "CBE" : "ንግድ ባንክ",
    accountNumber: cbeAccount?.trim() || "1000313542002",
    icon: Building2,
    badgeColor:
      "bg-purple-100 text-purple-900 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/40",
    accentBg: "bg-purple-500/10 border-purple-500/25",
  });

  // Telebirr: show if explicitly set or if default
  const showTelebirr = hasCustomAccounts
    ? Boolean(telebirrAccount && telebirrAccount.trim())
    : true;
  if (showTelebirr) {
    accounts.push({
      id: "telebirr",
      bankName: language === "en" ? "Telebirr" : language === "or" ? "Telebirr" : "ቴሌ ብር",
      shortName: language === "en" ? "Telebirr" : "ቴሌ ብር",
      accountNumber: (hasCustomAccounts ? telebirrAccount?.trim() : null) || "0921161705",
      icon: Smartphone,
      badgeColor:
        "bg-blue-100 text-blue-900 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/40",
      accentBg: "bg-blue-500/10 border-blue-500/25",
    });
  }

  // Abyssinia: show if explicitly set or if default
  const showAbyssinia = hasCustomAccounts
    ? Boolean(abyssiniaAccount && abyssiniaAccount.trim())
    : true;
  if (showAbyssinia) {
    accounts.push({
      id: "abyssinia",
      bankName:
        language === "en"
          ? "Bank of Abyssinia"
          : language === "or"
          ? "Baankii Abisiiniyaa"
          : "አቢሲኒያ ባንክ",
      shortName: language === "en" ? "Abyssinia" : "አቢሲኒያ",
      accountNumber: (hasCustomAccounts ? abyssiniaAccount?.trim() : null) || "68775663",
      icon: CreditCard,
      badgeColor:
        "bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40",
      accentBg: "bg-amber-500/10 border-amber-500/25",
    });
  }

  return (
    <div
      className={`rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/10 via-gold/5 to-transparent p-4 sm:p-5 shadow-sm ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gold/20 pb-3 mb-3.5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gold/20 text-navy-deep">
            <CreditCard className="h-4 w-4 text-navy-deep dark:text-gold" />
          </div>
          <h4 className="text-xs sm:text-sm font-bold text-navy-deep uppercase tracking-wider">
            {language === "en" ? "Payment Methods" : language === "or" ? "Karaalee Kaffaltii" : "የክፍያ አማራጮች"}
          </h4>
        </div>
        <span className="text-[10px] font-semibold text-gold-soft bg-navy-deep px-2 py-0.5 rounded-full">
          {language === "en" ? "Click number to copy" : language === "or" ? "Waraabuuf tuqi" : "ለመገልበጥ ቁጥሩን ይጫኑ"}
        </span>
      </div>

      {/* Account Owner */}
      <div className="mb-3 flex items-center gap-2 rounded-xl bg-white/70 dark:bg-navy-deep/60 px-3 py-2 border border-gold/25">
        <User className="h-4 w-4 text-gold shrink-0" />
        <div className="flex flex-wrap items-baseline gap-1.5 text-xs text-navy">
          <span className="font-semibold text-navy-deep/80">{accountOwner.label}:</span>
          <span className="font-bold text-navy-deep text-sm">{accountOwner.name}</span>
        </div>
      </div>

      {/* Accounts List */}
      <div className="space-y-2">
        {accounts.map((acc) => {
          const isCopied = copiedKey === acc.id;
          const Icon = acc.icon;
          return (
            <div
              key={acc.id}
              onClick={() => copyToClipboard(acc.id, acc.accountNumber)}
              className="group flex items-center justify-between gap-2 rounded-xl bg-white/90 dark:bg-navy-deep/80 p-2.5 sm:px-3 sm:py-2.5 border border-gold/25 hover:border-gold hover:shadow-md transition-all cursor-pointer"
              title={language === "en" ? "Click to copy account number" : "የሂሳብ ቁጥሩን ለመገልበጥ ይጫኑ"}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-navy-deep">
                  <Icon className="h-4 w-4 text-navy-deep dark:text-gold" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-navy-deep truncate">
                      {acc.bankName}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <code className="rounded bg-gold/20 px-2 py-0.5 font-mono text-xs sm:text-sm font-bold text-navy-deep tracking-wider">
                      {acc.accountNumber}
                    </code>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(acc.id, acc.accountNumber);
                }}
                className={`flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                  isCopied
                    ? "bg-green-600 text-white shadow-xs"
                    : "bg-gold/20 text-navy-deep hover:bg-gold hover:text-navy-deep"
                }`}
              >
                {isCopied ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>{language === "en" ? "Copied" : "ተገልብጧል"}</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{language === "en" ? "Copy" : "ገልብጥ"}</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
