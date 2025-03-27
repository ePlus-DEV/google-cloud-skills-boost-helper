import React, { useCallback, useState } from "react";
import FeatureTable from "~/components/FeatureTable"; // Adjust the path as needed
import { storage } from '@wxt-dev/storage';
import { Toaster } from 'react-hot-toast';
import "~/assets/tailwind.css";

function IndexOptions() {

  const [leaderBoard, setLeaderBoard] = useState<boolean>(false);

  useEffect(() => {
    leaderBoardChecked.getValue().then(setLeaderBoard);
  }, []);

  const handleCheckboxChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const isChecked = event.target.checked;
      setLeaderBoard(isChecked);
      // storage.setItem('local:leaderBoard', isChecked);
    },
    []
  );
  
  return (
    <div style={{ display: "flex", flexDirection: "column", padding: 16, width: 800, margin: "0 auto", height: "100vh", justifyContent: "center" }}>
      <Header />
      <FeatureTable checked={leaderBoard} onCheckboxChange={handleCheckboxChange} />
      <Footer />
      <Toaster position="top-center" reverseOrder={false}/>
    </div>
  );
}

export default IndexOptions;