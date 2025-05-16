import { useState, useEffect } from 'react';
import './App.css';
import { db } from './firebase';
import {
  doc,
  setDoc,
  onSnapshot,
} from 'firebase/firestore';

function App() {
  // May 21st, 2025, hourly slots (9am to 9pm)
  const hours = Array.from({ length: 13 }, (_, i) => 9 + i); // 9am to 9pm

  const SHIFTS_DOC_ID = 'may21-2025';
  const SHIFTS_DOC_REF = doc(db, 'shiftCalendars', SHIFTS_DOC_ID);

  // State: for each hour, track selected volunteers
  const [hourSelections, setHourSelections] = useState<{ [hour: number]: string[] }>(
    () => Object.fromEntries(hours.map((h) => [h, []]))
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // State for new name input for all hours
  const [localNames, setLocalNames] = useState<{ [hour: number]: string }>({});

  // Sync Firestore on mount and on change
  useEffect(() => {
    const unsub = onSnapshot(
      SHIFTS_DOC_REF,
      (docSnap) => {
        if (docSnap.exists()) {
          setHourSelections(docSnap.data().hourSelections || {});
        }
        setLoading(false);
      },
      () => {
        setError('Failed to sync with server.');
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  // Save to Firestore on change
  const saveToFirestore = async (newSelections: { [hour: number]: string[] }) => {
    try {
      await setDoc(SHIFTS_DOC_REF, { hourSelections: newSelections }, { merge: true });
    } catch (e) {
      setError('Failed to save.');
    }
  };

  // When adding/removing a name, also sync to Firestore
  // Example for add:
  // setHourSelections((prev) => {
  //   const updated = {
  //     ...prev,
  //     [hour]: prev[hour].includes(trimmed)
  //       ? prev[hour]
  //       : [...prev[hour], trimmed],
  //   };
  //   saveToFirestore(updated);
  //   return updated;
  // });
  // Example for remove:
  // setHourSelections((prev) => {
  //   const updated = {
  //     ...prev,
  //     [hour]: prev[hour].filter((n) => n !== name),
  //   };
  //   saveToFirestore(updated);
  //   return updated;
  // });

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <main style={{ maxWidth: 500, margin: '0 auto', textAlign: 'left' }}>
      <h1>Volunteer Shift Calendar</h1>
      <form aria-label="Shift calendar form" autoComplete="off">
        <fieldset style={{ border: 'none', padding: 0, marginBottom: 12 }}>
          <legend>Assign volunteers to each hour on May 21st</legend>
          {hours.map((hour) => {
            const hourLabel = new Date(2025, 4, 21, hour).toLocaleTimeString([], {
              hour: '2-digit', minute: '2-digit', hour12: true
            });
            return (
              <div key={hour} style={{ marginBottom: 24 }}>
                <label htmlFor={`hour-${hour}`} style={{ fontWeight: 600 }}>
                  {hourLabel}
                </label>
                <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
                  {hourSelections[hour].map((name, idx) => (
                    <li key={name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ minWidth: 20, textAlign: 'right', color: '#888', fontVariantNumeric: 'tabular-nums' }}>{idx + 1}.</span>
                      <span style={{ flex: 1 }}>{name}</span>
                      <button
                        type="button"
                        aria-label={`Remove ${name} from ${hourLabel}`}
                        onClick={() => {
                          setHourSelections((prev) => {
                            const updated = {
                              ...prev,
                              [hour]: prev[hour].filter((n) => n !== name),
                            };
                            saveToFirestore(updated);
                            return updated;
                          });
                        }}
                        style={{
                          background: 'none',
                          color: '#ff4d4f',
                          border: 'none',
                          borderRadius: '50%',
                          width: 24,
                          height: 24,
                          fontWeight: 700,
                          fontSize: 14,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginLeft: 4,
                          lineHeight: 1,
                        }}
                      >
                        <span style={{fontSize: '1.1em', fontWeight: 700, fontFamily: 'monospace', lineHeight: 1}}>×</span>
                      </button>
                    </li>
                  ))}
                </ul>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <input
                    type="text"
                    placeholder="Add name to this shift"
                    value={localNames[hour] || ''}
                    onChange={e => setLocalNames(prev => ({ ...prev, [hour]: e.target.value }))}
                    style={{ flex: 1, minWidth: 0 }}
                    aria-label={`Add name to ${hourLabel}`}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const trimmed = localNames[hour]?.trim();
                        if (!trimmed) return;
                        setHourSelections((prev) => {
                          const updated = {
                            ...prev,
                            [hour]: prev[hour].includes(trimmed)
                              ? prev[hour]
                              : [...prev[hour], trimmed],
                          };
                          saveToFirestore(updated);
                          return updated;
                        });
                        setLocalNames(prev => ({ ...prev, [hour]: '' }));
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const trimmed = localNames[hour]?.trim();
                      if (!trimmed) return;
                      setHourSelections((prev) => {
                        const updated = {
                          ...prev,
                          [hour]: prev[hour].includes(trimmed)
                            ? prev[hour]
                            : [...prev[hour], trimmed],
                        };
                        saveToFirestore(updated);
                        return updated;
                      });
                      setLocalNames(prev => ({ ...prev, [hour]: '' }));
                    }}
                    disabled={!localNames[hour]?.trim()}
                    aria-label={`Add name to ${hourLabel}`}
                    style={{ padding: '0.4em 1em', fontWeight: 600 }}
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </fieldset>
      </form>
    </main>
  );
}

export default App;
