import React, { useEffect, useState } from 'react';
import { getDatabase, ref, onValue, set } from 'firebase/database';

import "./dnm.css"
import { app } from "../../firebase/firebase";



const database = getDatabase(app);
console.log(database)
export const Iotchiller = () => {
  const [machineKeys, setMachineKeys] = useState([]);
  const [allMachineData, setAllMachineData] = useState({});
  const fieldNames = ["Counter Reset", "Pulse", "Stop PLC"];

  

  // Default write list structure
  const defaultWriteList = [
    { data: "0", data_type: 0, request_type: 5, starting_reg_addr: 519 },
    { data: "1", data_type: 0, request_type: 5, starting_reg_addr: 520 },
    { data: "0", data_type: 0, request_type: 5, starting_reg_addr: 527 },
  ];

  // Fetch all machine keys
  useEffect(() => {
    const rootRef = ref(database);
    onValue(rootRef, (snapshot) => {
      const rootData = snapshot.val();
      if (rootData) {
        const keys = Object.keys(rootData).filter((key) => key.startsWith("SAFC_M"));
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
      const records = raw
        ? Object.values(raw).map(({ ts, values }) => ({
            ts,
            bottle_count: values?.bottle_count,
            plc_status: values?.plc_status,
            chiller: values?.chiller != null ? (Number(values.chiller) / 10).toFixed(1) : null,
            pump : values?.pump,
            fan: values?.fan,
            comp : values?.comp,
            fsw_trip: values?.fsw_trip,
            kp1_trip: values?.kp1_trip,
          }))
        : [];

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
      const writeList = writeData?.params?.write_list;

      setAllMachineData((prev) => ({
        ...prev,
        [machine]: {
          ...(prev[machine] || {}),
          writeList: writeList || defaultWriteList,
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
  const handleWrite = async (machine) => {
    const payload = {
      method: "do_mb_write",
      params: {
        device_name: "plc_device",
        write_list: allMachineData[machine].writeList,
      },
    };
    const writeRef = ref(database, `/${machine}/write`);
    try {
      await set(writeRef, payload);
      console.log(`Write to ${machine}:`, payload);
    } catch (err) {
      console.error(`Write error for ${machine}:`, err);
    }
  };

  return (
    <div className="MainCon">
      <h3>Machine With Chiller</h3>

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
                <table className="Mtable1">
                  <thead>
                    <tr>
                      <th>Bottle Count</th>
                      <th>PLC Status</th>
                      <th>water</th>
                      <th>Pump</th>
                      <th>Compressor</th>
                      <th>Fan</th>
                      <th>FSW_Trip</th>
                      <th>KP1_Trip</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...records].reverse().slice(0,1).map((r, i) => (
                      <tr key={i}>
                      
                        <td>{r.bottle_count}</td>
                        <td>{r.plc_status === 1 ? "OFF" : "ON"}</td>
                        <td>{r.chiller}</td>
                        <td>{r.pump === 1 ? "on" : "off"}</td>
                        <td>{r.comp === 1 ? "on" : "off"}</td>
                        <td>{r.fan === 1 ? "on" : "off"}</td>
                        <td>{r.fsw_trip=== 1 ? "ok" : "trip"}</td>
                        <td>{r.kp1_trip=== 1 ? "ok" : "trip"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {writeList.map((item, i) => (
                <div key={i}  className="write-item">
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
                onClick={() => handleWrite(machine)}
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
