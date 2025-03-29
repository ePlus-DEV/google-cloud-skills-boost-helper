function Header() {
  return (
    <h3 className="text-xl font-semibold text-center">
      {chrome.i18n.getMessage("extensionName")}
    </h3>
  );
}

export default Header;
