import React, { useEffect, useState } from 'react';
import { getDatabase, ref, onValue, set } from 'firebase/database';

import "./dnm.css"
import { app } from "../../firebase/firebase";



const database = getDatabase(app);
export const Iot_chiller_pcl = () => {
 const [machineKeys, setMachineKeys] = useState([]);
   const [allMachineData, setAllMachineData] = useState({});
   const fieldNames = ["Counter Reset", "Pulse", "Stop PLC"];
 
   
 
  // // Default write list structure
   const defaultWriteList = [
     { data: "0", data_type: 0, request_type: 5, starting_reg_addr: 542 },
     { data: "1", data_type: 0, request_type: 5, starting_reg_addr: 543 },
     { data: "0", data_type: 0, request_type: 5, starting_reg_addr: 548 },
   ];
 
   // Fetch all machine keys
 useEffect(() => {
   const allowedMachineNumbers = [5]; // 👈 You provide this array
 
   const rootRef = ref(database);
   onValue(rootRef, (snapshot) => {
     const rootData = snapshot.val();
     if (rootData) {
       const keys = Object.keys(rootData).filter((key) => {
         if (!key.startsWith("SAFC_M")) return false;
 
         const num = parseInt(key.replace("SAFC_M", "").trim());
         return allowedMachineNumbers.includes(num);
       });
 
       setMachineKeys(keys);
     }
   });
 }, []);
 
   // Fetch read data for all machines
   useEffect(() => {
     machineKeys.forEach((machine) => {
       // READ data
       const readRef = ref(database, `/${machine}/read`);
       onValue(readRef, (snapshot) => {
         const raw = snapshot.val();
         // console.log(`Raw data from ${machine} read:`, raw);
 
         if (!raw) {
           console.error(`No data found for machine ${machine} at /${machine}/read`);
           return;
         }
 
         // Extract device key and data
         const deviceKey = Object.keys(raw || {})[0];
         console.log(`Device key for machine ${machine}:`, deviceKey);
 
         if (!deviceKey) {
           console.error(`No device key found in data for machine ${machine}`);
           return;
         }
 
         const deviceData = raw[deviceKey];
         console.log(`Device data for machine ${machine}:`, deviceData);
 
         if (!Array.isArray(deviceData)) {
           console.warn(`Device data for ${machine} is not an array. Found:`, deviceData);
           return;
         }
 
         // Map the array to extract relevant fields
         const records = deviceData.map(({ ts, values }) => ({
           ts,
           bottle_count: values?.bottle_count,
           plc_status: values?.plc_status,
         }));
 
         // Update state with records
         setAllMachineData((prev) => ({
           ...prev,
           [machine]: {
             ...(prev[machine] || {}),
             records,
           },
         }));
       });
 
       // WRITE data
       const writeRef = ref(database, `/${machine}/write`);
       onValue(writeRef, (snapshot) => {
         const writeData = snapshot.val();
         console.log(`Write data for machine ${machine}:`, writeData);
 
         const writeList = writeData?.params?.write_list || [];
         setAllMachineData((prev) => ({
           ...prev,
           [machine]: {
             ...(prev[machine] || {}),
             writeList,
           },
         }));
       });
     });
   }, [machineKeys]);
 
 
   // Handle write change
   const handleDataChange = (machine, index, value) => {
     setAllMachineData((prev) => {
       const updatedWriteList = prev[machine].writeList.map((item, i) =>
         i === index ? { ...item, data: value } : item
       );
       return {
         ...prev,
         [machine]: {
           ...prev[machine],
           writeList: updatedWriteList,
         },
       };
     });
   };
 
   // Handle writing data to each machine

const handleWrite = async (machine, writeList) => {
  const deviceNames = ["plc_device", "plc_device2"];
  const writeRef = ref(database, `/${machine}/write`);

  const payload1 = {
    method: "do_mb_write",
    params: {
      device_name: deviceNames[0],
      write_list: writeList, // ✅ Now using real-time values
    },
  };

  try {
    await set(writeRef, payload1);
    console.log(`✅ First write to ${deviceNames[0]}`, payload1);
  } catch (err) {
    console.error(`❌ Error writing to ${deviceNames[0]}`, err);
  }

  setTimeout(async () => {
    const payload2 = {
      method: "do_mb_write",
      params: {
        device_name: deviceNames[1],
        write_list: writeList,
      },
    };

    try {
      await set(writeRef, payload2);
      console.log(`✅ Second write to ${deviceNames[1]}`, payload2);
    } catch (err) {
      console.error(`❌ Error writing to ${deviceNames[1]}`, err);
    }
  }, 5000);
};

 



   return (
     <div className="MainCon">
       <h3>Machine With Chiller(60L)</h3>
 
       {machineKeys.length === 0 ? (
         <p>Loading machines...</p>
       ) : (
         machineKeys.map((machine) => {
           const machineData = allMachineData[machine] || {};
           const records = machineData.records || [];
           const writeList = machineData.writeList || defaultWriteList;
 
           return (
             <div key={machine} className='writ1'>
               <h2>{machine}</h2>
 
               {records.length === 0 ? (
                 <p>No records</p>
               ) : (
                 <table className="Mtable">
                   <thead>
                     <tr>
                       <th>Bottle Count</th>
                       <th>PLC Status</th>
                       
                     </tr>
                   </thead>
                   <tbody>
                     {[...records].reverse().slice(0, 1).map((r, i) => (
                       <tr key={i}>
 
                         <td>{r.bottle_count}</td>
                         <td>{r.plc_status === 1 ? "OFF" : "ON"}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               )}
 
               { writeList.map((item, i) => (
                 <div key={i} className='write-item'>
                   <strong>{fieldNames[i] || `Control ${i + 1}`}:</strong>{" "}
                   <select
                     value={item.data}
                     onChange={(e) => handleDataChange(machine, i, e.target.value)}
                   >
                     <option value="1">On</option>
                     <option value="0">Off</option>
                   </select>
                 </div>
               ))}
 
               <button
                onClick={() => handleWrite(machine, writeList)}
                 style={{
                   marginTop: "10px",
                   marginBottom: "30px",
                   padding: "10px 20px",
                   backgroundColor: "#28a745",
                   color: "white",
                   border: "none",
                   borderRadius: "8px",
                   cursor: "pointer",
                 }}
               >
                 Write to {machine}
               </button>
             </div>
 
           );
         })
       )}
 
     
     </div>
   );
 };
 