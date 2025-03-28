import axios from "axios";

const addSpinner = (element: HTMLElement | null) => {
	if (element) {
		element.classList.add("animate-spin");
	}
};

const removeSpinner = (element: HTMLElement | null) => {
	if (element) {
		element.classList.remove("animate-spin");
	}
};

const fetchData = async (url: string) => {
	try {
		return await axios.post("https://cors.eplus.dev/https://arcadepoints.vercel.app/api/submit", { url });
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
	const refreshButton = document.querySelector("refresh-button") as HTMLButtonElement | null;
	const refreshIcon = document.getElementById("refresh-icon");
	addSpinner(refreshIcon);

	if (refreshButton) {
		refreshButton.disabled = true; // Disable the button
	}

	try {
		const response = await fetchData(
			"https://www.cloudskillsboost.google/public_profiles/e0963130-302f-49dc-9634-e63e0d8e1f1a"
		);

		if (response.status === 200) {
			displayUserDetails(response.data);
		} else {
			console.error("Failed to submit URL.");
		}
	} catch {
		// Error already logged in fetchData
	} finally {
		removeSpinner(refreshIcon);
		if (refreshButton) {
			refreshButton.disabled = false; // Re-enable the button
		}
	}
};

document.querySelectorAll(".refresh-button").forEach((button) => {
	button.addEventListener("click", handleSubmit);
});
