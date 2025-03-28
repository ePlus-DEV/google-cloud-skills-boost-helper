import axios from "axios";

const SPINNER_CLASS = "animate-spin";
const API_URL = "https://cors.eplus.dev/https://arcadepoints.vercel.app/api/submit";
const PROFILE_URL = "https://www.cloudskillsboost.google/public_profiles/e0963130-302f-49dc-9634-e63e0d8e1f1a";

const toggleSpinner = (elements: NodeListOf<HTMLElement>, add: boolean) => {
	elements.forEach((element) => {
		if (add) {
			element.classList.add(SPINNER_CLASS);
		} else {
			element.classList.remove(SPINNER_CLASS);
		}
	});
};

const toggleButtonState = (buttons: NodeListOf<HTMLButtonElement>, disabled: boolean) => {
	buttons.forEach((button) => (button.disabled = disabled));
};

const fetchData = async (url: string) => {
	try {
		return await axios.post(API_URL, { url });
	} catch (error) {
		console.error("Error submitting URL:", error);
		throw error;
	}
};

const displayUserDetails = (data: any) => {
	const { userDetails, arcadePoints } = data;
	const { userName, memberSince, league } = userDetails[0] || {};
	const { totalPoints, gamePoints, triviaPoints, skillPoints, specialPoints } = arcadePoints;

	const manifest = chrome.runtime.getManifest();
	const iconUrl = manifest.icons ? chrome.runtime.getURL(manifest.icons["48"]) : "";

	alert(
		`User: ${userName}\nLeague: ${league}\nMember Since: ${memberSince}\nTotal Points: ${totalPoints}\nGame Points: ${gamePoints}\nTrivia Points: ${triviaPoints}\nSkill Points: ${skillPoints}\nSpecial Points: ${specialPoints}`
	);
	console.log(iconUrl);
};

const handleSubmit = async () => {
	const refreshButtons = document.querySelectorAll(".refresh-button") as NodeListOf<HTMLButtonElement>;
	const refreshIcons = document.querySelectorAll(".refresh-icon") as NodeListOf<HTMLElement>;

	toggleSpinner(refreshIcons, true);
	toggleButtonState(refreshButtons, true);

	try {
		const response = await fetchData(PROFILE_URL);

		if (response.status === 200) {
			displayUserDetails(response.data);
		} else {
			console.error("Failed to submit URL.");
		}
	} catch {
		// Error already logged in fetchData
	} finally {
		toggleSpinner(refreshIcons, false);
		toggleButtonState(refreshButtons, false);
	}
};

const initializeEventListeners = () => {
	document.querySelectorAll(".refresh-button").forEach((button) => {
		button.addEventListener("click", handleSubmit);
	});
};

initializeEventListeners();
