type BonusMilestoneCopy = {
  claim: string;
  claimTooltip: string;
  confirmTitle: string;
  confirmMessage: string;
  confirmCheckbox: string;
  confirmButton: string;
  confirmedTitle: string;
  confirmedMessage: string;
  removeButton: string;
  appliedTooltip: string;
  disclaimer: string;
  officialPage: string;
  updating: string;
  error: string;
};

const COPY: Record<string, BonusMilestoneCopy> = {
  en: {
    claim: "Claim +{points}",
    claimTooltip:
      "Bonus Milestone: confirm completion to add +{points} points.",
    confirmTitle: "Confirm Bonus Milestone",
    confirmMessage:
      "This bonus is self-reported. Confirm only after you have completed the Bonus Milestone.",
    confirmCheckbox: "I confirm that I completed the Bonus Milestone.",
    confirmButton: "Confirm +{points}",
    confirmedTitle: "Bonus Milestone confirmed",
    confirmedMessage: "+{points} points are currently applied.",
    removeButton: "Undo confirmation",
    appliedTooltip: "Bonus Milestone confirmed: +{points} points applied.",
    disclaimer:
      "Self-reported only. This confirmation is shown by the extension and does not mean Google Cloud Skills Boost / Arcade has verified or awarded these points.",
    officialPage: "Open official Bonus Milestone page",
    updating: "Updating…",
    error: "Could not update the Bonus Milestone. Please try again.",
  },
  vi: {
    claim: "Nhận +{points}",
    claimTooltip:
      "Bonus Milestone: xác nhận hoàn thành để cộng +{points} điểm.",
    confirmTitle: "Xác nhận Bonus Milestone",
    confirmMessage:
      "Điểm thưởng này do bạn tự xác nhận. Chỉ xác nhận sau khi đã hoàn thành Bonus Milestone.",
    confirmCheckbox: "Tôi xác nhận đã hoàn thành Bonus Milestone.",
    confirmButton: "Xác nhận +{points}",
    confirmedTitle: "Đã xác nhận Bonus Milestone",
    confirmedMessage: "+{points} điểm đang được cộng.",
    removeButton: "Hủy xác nhận",
    appliedTooltip: "Đã xác nhận Bonus Milestone: đã cộng +{points} điểm.",
    disclaimer:
      "Chỉ là tự xác nhận. Xác nhận này chỉ được hiển thị trong extension và không có nghĩa Google Cloud Skills Boost / Arcade đã xác minh hoặc công nhận số điểm này.",
    officialPage: "Mở trang Bonus Milestone chính thức",
    updating: "Đang cập nhật…",
    error: "Không thể cập nhật Bonus Milestone. Vui lòng thử lại.",
  },
  ja: {
    claim: "+{points} を受け取る",
    claimTooltip:
      "Bonus Milestone の完了を確認すると +{points} ポイントが加算されます。",
    confirmTitle: "Bonus Milestone を確認",
    confirmMessage:
      "このボーナスは自己申告です。Bonus Milestone を完了した後にのみ確認してください。",
    confirmCheckbox: "Bonus Milestone を完了したことを確認します。",
    confirmButton: "+{points} を確定",
    confirmedTitle: "Bonus Milestone 確認済み",
    confirmedMessage: "現在 +{points} ポイントが加算されています。",
    removeButton: "確認を取り消す",
    appliedTooltip: "Bonus Milestone 確認済み: +{points} ポイント適用中。",
    disclaimer:
      "自己申告のみです。この確認は拡張機能内で表示されるもので、Google Cloud Skills Boost / Arcade が完了を検証したり、このポイントを正式に付与したことを意味しません。",
    officialPage: "公式 Bonus Milestone ページを開く",
    updating: "更新中…",
    error: "Bonus Milestone を更新できませんでした。もう一度お試しください。",
  },
  ko: {
    claim: "+{points} 받기",
    claimTooltip:
      "Bonus Milestone 완료를 확인하면 +{points}포인트가 추가됩니다.",
    confirmTitle: "Bonus Milestone 확인",
    confirmMessage:
      "이 보너스는 사용자 직접 확인 방식입니다. Bonus Milestone을 완료한 뒤에만 확인해 주세요.",
    confirmCheckbox: "Bonus Milestone을 완료했음을 확인합니다.",
    confirmButton: "+{points} 확인",
    confirmedTitle: "Bonus Milestone 확인됨",
    confirmedMessage: "현재 +{points}포인트가 적용되어 있습니다.",
    removeButton: "확인 취소",
    appliedTooltip: "Bonus Milestone 확인됨: +{points}포인트 적용됨.",
    disclaimer:
      "사용자 자체 확인만을 위한 기능입니다. 이 확인은 확장 프로그램에 표시되는 것이며 Google Cloud Skills Boost / Arcade가 완료를 검증했거나 해당 포인트를 공식적으로 부여했다는 의미가 아닙니다.",
    officialPage: "공식 Bonus Milestone 페이지 열기",
    updating: "업데이트 중…",
    error: "Bonus Milestone을 업데이트할 수 없습니다. 다시 시도해 주세요.",
  },
  zh_CN: {
    claim: "领取 +{points}",
    claimTooltip: "确认已完成 Bonus Milestone 后可增加 +{points} 分。",
    confirmTitle: "确认 Bonus Milestone",
    confirmMessage:
      "此奖励由用户自行确认。仅在完成 Bonus Milestone 后进行确认。",
    confirmCheckbox: "我确认已完成 Bonus Milestone。",
    confirmButton: "确认 +{points}",
    confirmedTitle: "已确认 Bonus Milestone",
    confirmedMessage: "当前已计入 +{points} 分。",
    removeButton: "撤销确认",
    appliedTooltip: "已确认 Bonus Milestone：已计入 +{points} 分。",
    disclaimer:
      "仅为用户自行确认。此确认仅显示在扩展程序中，并不表示 Google Cloud Skills Boost / Arcade 已验证完成情况或正式授予这些积分。",
    officialPage: "打开官方 Bonus Milestone 页面",
    updating: "正在更新…",
    error: "无法更新 Bonus Milestone，请重试。",
  },
  de: {
    claim: "+{points} erhalten",
    claimTooltip:
      "Bonus Milestone: Abschluss bestätigen und +{points} Punkte erhalten.",
    confirmTitle: "Bonus Milestone bestätigen",
    confirmMessage:
      "Dieser Bonus wird selbst bestätigt. Bitte nur bestätigen, wenn du den Bonus Milestone abgeschlossen hast.",
    confirmCheckbox:
      "Ich bestätige, dass ich den Bonus Milestone abgeschlossen habe.",
    confirmButton: "+{points} bestätigen",
    confirmedTitle: "Bonus Milestone bestätigt",
    confirmedMessage: "+{points} Punkte werden derzeit angerechnet.",
    removeButton: "Bestätigung zurücknehmen",
    appliedTooltip: "Bonus Milestone bestätigt: +{points} Punkte angerechnet.",
    disclaimer:
      "Nur Selbstbestätigung. Diese Bestätigung wird nur in der Erweiterung angezeigt und bedeutet nicht, dass Google Cloud Skills Boost / Arcade den Abschluss geprüft oder diese Punkte offiziell vergeben hat.",
    officialPage: "Offizielle Bonus-Milestone-Seite öffnen",
    updating: "Wird aktualisiert…",
    error:
      "Bonus Milestone konnte nicht aktualisiert werden. Bitte erneut versuchen.",
  },
  es: {
    claim: "Obtener +{points}",
    claimTooltip:
      "Bonus Milestone: confirma que lo completaste para sumar +{points} puntos.",
    confirmTitle: "Confirmar Bonus Milestone",
    confirmMessage:
      "Este bonus es autodeclarado. Confírmalo solo después de completar el Bonus Milestone.",
    confirmCheckbox: "Confirmo que completé el Bonus Milestone.",
    confirmButton: "Confirmar +{points}",
    confirmedTitle: "Bonus Milestone confirmado",
    confirmedMessage: "Actualmente se aplican +{points} puntos.",
    removeButton: "Deshacer confirmación",
    appliedTooltip: "Bonus Milestone confirmado: +{points} puntos aplicados.",
    disclaimer:
      "Solo autodeclarado. Esta confirmación se muestra en la extensión y no significa que Google Cloud Skills Boost / Arcade haya verificado la finalización ni otorgado oficialmente estos puntos.",
    officialPage: "Abrir la página oficial de Bonus Milestone",
    updating: "Actualizando…",
    error: "No se pudo actualizar el Bonus Milestone. Inténtalo de nuevo.",
  },
  fr: {
    claim: "Obtenir +{points}",
    claimTooltip:
      "Bonus Milestone : confirmez la réussite pour ajouter +{points} points.",
    confirmTitle: "Confirmer le Bonus Milestone",
    confirmMessage:
      "Ce bonus est auto-déclaré. Confirmez uniquement après avoir terminé le Bonus Milestone.",
    confirmCheckbox: "Je confirme avoir terminé le Bonus Milestone.",
    confirmButton: "Confirmer +{points}",
    confirmedTitle: "Bonus Milestone confirmé",
    confirmedMessage: "+{points} points sont actuellement appliqués.",
    removeButton: "Annuler la confirmation",
    appliedTooltip: "Bonus Milestone confirmé : +{points} points appliqués.",
    disclaimer:
      "Auto-déclaration uniquement. Cette confirmation est affichée dans l’extension et ne signifie pas que Google Cloud Skills Boost / Arcade a vérifié la réussite ou attribué officiellement ces points.",
    officialPage: "Ouvrir la page officielle du Bonus Milestone",
    updating: "Mise à jour…",
    error: "Impossible de mettre à jour le Bonus Milestone. Réessayez.",
  },
  it: {
    claim: "Ottieni +{points}",
    claimTooltip:
      "Bonus Milestone: conferma il completamento per aggiungere +{points} punti.",
    confirmTitle: "Conferma Bonus Milestone",
    confirmMessage:
      "Questo bonus è auto-dichiarato. Conferma solo dopo aver completato il Bonus Milestone.",
    confirmCheckbox: "Confermo di aver completato il Bonus Milestone.",
    confirmButton: "Conferma +{points}",
    confirmedTitle: "Bonus Milestone confermato",
    confirmedMessage: "Sono attualmente applicati +{points} punti.",
    removeButton: "Annulla conferma",
    appliedTooltip: "Bonus Milestone confermato: +{points} punti applicati.",
    disclaimer:
      "Solo autodichiarazione. Questa conferma viene mostrata nell’estensione e non significa che Google Cloud Skills Boost / Arcade abbia verificato il completamento o assegnato ufficialmente questi punti.",
    officialPage: "Apri la pagina ufficiale del Bonus Milestone",
    updating: "Aggiornamento…",
    error: "Impossibile aggiornare il Bonus Milestone. Riprova.",
  },
  pt_BR: {
    claim: "Receber +{points}",
    claimTooltip:
      "Bonus Milestone: confirme a conclusão para adicionar +{points} pontos.",
    confirmTitle: "Confirmar Bonus Milestone",
    confirmMessage:
      "Este bônus é autodeclarado. Confirme somente depois de concluir o Bonus Milestone.",
    confirmCheckbox: "Confirmo que concluí o Bonus Milestone.",
    confirmButton: "Confirmar +{points}",
    confirmedTitle: "Bonus Milestone confirmado",
    confirmedMessage: "+{points} pontos estão sendo aplicados.",
    removeButton: "Desfazer confirmação",
    appliedTooltip: "Bonus Milestone confirmado: +{points} pontos aplicados.",
    disclaimer:
      "Somente autodeclaração. Esta confirmação é exibida na extensão e não significa que o Google Cloud Skills Boost / Arcade verificou a conclusão ou concedeu oficialmente esses pontos.",
    officialPage: "Abrir a página oficial do Bonus Milestone",
    updating: "Atualizando…",
    error: "Não foi possível atualizar o Bonus Milestone. Tente novamente.",
  },
  ru: {
    claim: "Получить +{points}",
    claimTooltip:
      "Bonus Milestone: подтвердите выполнение, чтобы добавить +{points} очков.",
    confirmTitle: "Подтвердить Bonus Milestone",
    confirmMessage:
      "Этот бонус подтверждается пользователем самостоятельно. Подтверждайте только после выполнения Bonus Milestone.",
    confirmCheckbox: "Я подтверждаю, что выполнил(а) Bonus Milestone.",
    confirmButton: "Подтвердить +{points}",
    confirmedTitle: "Bonus Milestone подтвержден",
    confirmedMessage: "Сейчас начислено +{points} очков.",
    removeButton: "Отменить подтверждение",
    appliedTooltip: "Bonus Milestone подтвержден: начислено +{points} очков.",
    disclaimer:
      "Только самоподтверждение. Это подтверждение отображается в расширении и не означает, что Google Cloud Skills Boost / Arcade проверил выполнение или официально начислил эти баллы.",
    officialPage: "Открыть официальную страницу Bonus Milestone",
    updating: "Обновление…",
    error: "Не удалось обновить Bonus Milestone. Попробуйте еще раз.",
  },
  hi: {
    claim: "+{points} प्राप्त करें",
    claimTooltip:
      "Bonus Milestone पूरा होने की पुष्टि करके +{points} अंक जोड़ें।",
    confirmTitle: "Bonus Milestone की पुष्टि करें",
    confirmMessage:
      "यह बोनस उपयोगकर्ता द्वारा स्वयं पुष्टि किया जाता है। Bonus Milestone पूरा करने के बाद ही पुष्टि करें।",
    confirmCheckbox:
      "मैं पुष्टि करता/करती हूँ कि मैंने Bonus Milestone पूरा कर लिया है।",
    confirmButton: "+{points} की पुष्टि करें",
    confirmedTitle: "Bonus Milestone की पुष्टि हो गई",
    confirmedMessage: "अभी +{points} अंक लागू हैं।",
    removeButton: "पुष्टि हटाएँ",
    appliedTooltip: "Bonus Milestone की पुष्टि हो गई: +{points} अंक लागू हैं।",
    disclaimer:
      "केवल स्वयं की पुष्टि। यह पुष्टि एक्सटेंशन में दिखाई जाती है और इसका अर्थ यह नहीं है कि Google Cloud Skills Boost / Arcade ने पूर्णता सत्यापित की है या इन अंकों को आधिकारिक रूप से प्रदान किया है।",
    officialPage: "आधिकारिक Bonus Milestone पेज खोलें",
    updating: "अपडेट हो रहा है…",
    error: "Bonus Milestone अपडेट नहीं हो सका। कृपया फिर से कोशिश करें।",
  },
  ar: {
    claim: "احصل على +{points}",
    claimTooltip: "Bonus Milestone: أكّد الإكمال لإضافة +{points} نقطة.",
    confirmTitle: "تأكيد Bonus Milestone",
    confirmMessage:
      "هذه المكافأة تعتمد على تأكيد المستخدم. أكّد فقط بعد إكمال Bonus Milestone.",
    confirmCheckbox: "أؤكد أنني أكملت Bonus Milestone.",
    confirmButton: "تأكيد +{points}",
    confirmedTitle: "تم تأكيد Bonus Milestone",
    confirmedMessage: "يتم حاليًا احتساب +{points} نقطة.",
    removeButton: "إلغاء التأكيد",
    appliedTooltip: "Bonus Milestone 확인됨: +{points}포인트 적용됨.",
    disclaimer:
      "تأكيد ذاتي فقط. يظهر هذا التأكيد داخل الإضافة ولا يعني أن Google Cloud Skills Boost / Arcade قد تحقّق من الإكمال أو منح هذه النقاط رسميًا.",
    officialPage: "فتح صفحة Bonus Milestone الرسمية",
    updating: "جارٍ التحديث…",
    error: "تعذر تحديث Bonus Milestone. حاول مرة أخرى.",
  },
};

/** Resolve the best supported locale for Bonus Milestone copy. */
function resolveLocale(): string {
  let raw = "en";
  try {
    raw = browser.i18n.getUILanguage() || "en";
  } catch {
    raw = "en";
  }

  const normalized = raw.replace("-", "_");
  if (COPY[normalized]) return normalized;

  const base = normalized.split("_")[0];
  return COPY[base] ? base : "en";
}

export type BonusMilestoneCopyKey = keyof BonusMilestoneCopy;

/** Return localized Bonus Milestone copy with an optional point placeholder. */
export function getBonusMilestoneMessage(
  key: BonusMilestoneCopyKey,
  points?: number | string,
): string {
  const copy = COPY[resolveLocale()] || COPY.en;
  const value = copy[key] || COPY.en[key];
  return value.replaceAll("{points}", String(points ?? ""));
}

/** Return the localized cancel label, falling back to English. */
export function getBonusMilestoneCancelLabel(): string {
  try {
    return browser.i18n.getMessage("cancelButton" as never) || "Cancel";
  } catch {
    return "Cancel";
  }
}
