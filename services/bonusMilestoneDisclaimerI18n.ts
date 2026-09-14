const DISCLAIMER_COPY: Record<string, string> = {
  en: "Self-reported only. This confirmation is shown by the extension and does not mean Google Cloud Skills Boost / Arcade has verified or awarded these points.",
  vi: "Chỉ là tự xác nhận. Xác nhận này chỉ được hiển thị trong extension và không có nghĩa Google Cloud Skills Boost / Arcade đã xác minh hoặc công nhận số điểm này.",
  ja: "自己申告のみです。この確認は拡張機能内で表示されるもので、Google Cloud Skills Boost / Arcade が完了を検証したり、このポイントを正式に付与したことを意味しません。",
  ko: "사용자 자체 확인만을 위한 기능입니다. 이 확인은 확장 프로그램에 표시되는 것이며 Google Cloud Skills Boost / Arcade가 완료를 검증했거나 해당 포인트를 공식적으로 부여했다는 의미가 아닙니다.",
  zh_CN:
    "仅为用户自行确认。此确认仅显示在扩展程序中，并不表示 Google Cloud Skills Boost / Arcade 已验证完成情况或正式授予这些积分。",
  de: "Nur Selbstbestätigung. Diese Bestätigung wird nur in der Erweiterung angezeigt und bedeutet nicht, dass Google Cloud Skills Boost / Arcade den Abschluss geprüft oder diese Punkte offiziell vergeben hat.",
  es: "Solo autodeclarado. Esta confirmación se muestra en la extensión y no significa que Google Cloud Skills Boost / Arcade haya verificado la finalización ni otorgado oficialmente estos puntos.",
  fr: "Auto-déclaration uniquement. Cette confirmation est affichée dans l’extension et ne signifie pas que Google Cloud Skills Boost / Arcade a vérifié la réussite ou attribué officiellement ces points.",
  it: "Solo autodichiarazione. Questa conferma viene mostrata nell’estensione e non significa che Google Cloud Skills Boost / Arcade abbia verificato il completamento o assegnato ufficialmente questi punti.",
  pt_BR:
    "Somente autodeclaração. Esta confirmação é exibida na extensão e não significa que o Google Cloud Skills Boost / Arcade verificou a conclusão ou concedeu oficialmente esses pontos.",
  ru: "Только самоподтверждение. Это подтверждение отображается в расширении и не означает, что Google Cloud Skills Boost / Arcade проверил выполнение или официально начислил эти баллы.",
  hi: "केवल स्वयं की पुष्टि। यह पुष्टि एक्सटेंशन में दिखाई जाती है और इसका अर्थ यह नहीं है कि Google Cloud Skills Boost / Arcade ने पूर्णता सत्यापित की है या इन अंकों को आधिकारिक रूप से प्रदान किया है।",
  ar: "تأكيد ذاتي فقط. يظهر هذا التأكيد داخل الإضافة ولا يعني أن Google Cloud Skills Boost / Arcade قد تحقّق من الإكمال أو منح هذه النقاط رسميًا.",
};

/** Resolve the best supported locale for the Bonus Milestone disclaimer. */
function resolveDisclaimerLocale(): string {
  let raw = "en";
  try {
    raw = browser.i18n.getUILanguage() || "en";
  } catch {
    raw = "en";
  }

  const normalized = raw.replace("-", "_");
  if (DISCLAIMER_COPY[normalized]) return normalized;

  const base = normalized.split("_")[0];
  return DISCLAIMER_COPY[base] ? base : "en";
}

/** Return the localized self-reported / non-Google-verification disclaimer. */
export function getBonusMilestoneDisclaimer(): string {
  return DISCLAIMER_COPY[resolveDisclaimerLocale()] || DISCLAIMER_COPY.en;
}
