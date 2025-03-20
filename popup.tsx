import React, { useCallback, useState } from "react";

import toast, { Toaster } from 'react-hot-toast';
import { useStorage } from "@plasmohq/storage/hook";

import Header from "~components/header"
import Footer from "~components/footer"
import FeatureTable from "~components/feature/table"

import "./style.css";

function IndexPopup() {
    const [checked, setChecked] = useStorage("checked", false);

    const handleCheckboxChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            setChecked(event.target.checked);
        },
        [setChecked]
    );

    return (
        <div style={{ display: "flex", flexDirection: "column", padding: 16, width: 400 }}>
            <Header />
            <FeatureTable checked={checked} onCheckboxChange={handleCheckboxChange} />
            <Footer />
            <Toaster position="top-center" reverseOrder={false}/>
        </div>
    );
}



export default IndexPopup;
