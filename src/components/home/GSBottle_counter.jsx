import React, { useEffect, useState } from 'react';
import { getDatabase, ref, onValue, set } from 'firebase/database';

import "./dnm.css"
import { app } from "../../firebase/firebase";

const database = getDatabase(app);
console.log(database)

export const GSBottle_counter = () => {
 const [machineKeys, setMachineKeys] = useState([]);
  const [allMachineData, setAllMachineData] = useState({});
  const fieldNames = ["Counter Reset", "Pulse", "Stop PLC","m1"];

  // Default write list structure
  const defaultWriteList = [
    { data: "0", data_type: 0, request_type: 5, starting_reg_addr: 542 },
    { data: "1", data_type: 0, request_type: 5, starting_reg_addr: 543 },
    { data: "0", data_type: 0, request_type: 5, starting_reg_addr: 548 },
    {
            data: "2",
            data_type: 7,
            request_type: 16,
            starting_reg_addr: 1576
        },
  ];

  // Fetch all machine keys
  useEffect(() => {
    const rootRef = ref(database);
    onValue(rootRef, (snapshot) => {
      const rootData = snapshot.val();
      if (rootData) {
        const keys = Object.keys(rootData).filter((key) => key.startsWith("Machine"));
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
      <h3>All Machine Data</h3>

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
                      {/* <th>S.No.</th> */}
                      <th>Bottle Count</th>
                      <th>PLC Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...records].reverse().slice(0,1).map((r, i) => (
                      <tr key={i}>
                        {/* <td>{i + 1}</td> */}
                        <td>{r.bottle_count}</td>
                        <td>{r.plc_status === 1 ? "OFF" : "ON"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {writeList.slice(0,3).map((item, i) => (
                <div key={i} className="write-item">
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
