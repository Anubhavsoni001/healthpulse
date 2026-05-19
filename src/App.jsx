import { useState, useEffect } from 'react';
// import { registerAndSubscribe } from './push'; // Commented out as push.js is missing

export default function App() {
  const [sub, setSub] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Load alerts from localStorage on initial render
  const [alerts, setAlerts] = useState(() => {
    try {
      const saved = localStorage.getItem('healthpulse_alerts');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Save alerts to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('healthpulse_alerts', JSON.stringify(alerts));
  }, [alerts]);


  const sendTest = async () => {
    const msg = "🧪 Test Alert: Connectivity Check.";
    triggerAlert(msg);
  };

  const simulateSepsis = async () => {
    const msg = "🚨 <b>SEVERE SEPSIS ALERT:</b> Patient Bed 4 - Vitals deteriorating rapidly. Heart Rate &gt; 120, Temp &gt; 39°C. Immediate attention required.";
    triggerAlert(msg);
  };

  const triggerAlert = async (text) => {
    // 1. Save to Local Mobile UI State (Alerts Section)
    const newAlert = { id: Date.now(), text, time: new Date().toLocaleTimeString() };
    setAlerts(prev => [newAlert, ...prev]);

    // 2. Send to Telegram
    try {
      const response = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      
      if (!response.ok) {
        const errText = await response.text();
        alert(`Failed to send alert. Status: ${response.status}\nError: ${errText}`);
      } else {
        console.log("Telegram alert sent successfully");
      }
    } catch (err) {
      console.error("Failed to send to Telegram:", err);
      alert(`Network error: ${err.message}`);
    }
  };

  const clearAlerts = () => {
    setAlerts([]);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      {/* App Header & Navigation */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', backgroundColor: '#f8f9fa', borderBottom: '1px solid #ddd' }}>
        <h2 style={{ margin: 0, color: '#e63946' }}>HealthPulse</h2>
        <div>
          <button 
            style={{ 
              marginRight: 10, padding: '8px 12px', cursor: 'pointer', 
              background: activeTab === 'dashboard' ? '#e63946' : '#fff', 
              color: activeTab === 'dashboard' ? '#fff' : '#333', 
              border: '1px solid #e63946', borderRadius: '4px' 
            }}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            style={{ 
              padding: '8px 12px', cursor: 'pointer', position: 'relative', 
              background: activeTab === 'alerts' ? '#e63946' : '#fff', 
              color: activeTab === 'alerts' ? '#fff' : '#333', 
              border: '1px solid #e63946', borderRadius: '4px' 
            }}
            onClick={() => setActiveTab('alerts')}
          >
            Alerts
            {alerts.length > 0 && (
              <span style={{ 
                position: 'absolute', top: -8, right: -8, background: '#d00000', 
                color: '#fff', borderRadius: '50%', padding: '2px 6px', fontSize: '12px' 
              }}>
                {alerts.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ padding: '20px' }}>
        {activeTab === 'dashboard' ? (
          <div>
            <h3>Dashboard Actions</h3>
            <p style={{ color: '#555' }}>Monitor patient vitals and manage system settings.</p>
            
            <div style={{ marginBottom: 20 }}>
              <button onClick={sendTest} style={{ padding: '10px 15px', cursor: 'pointer', borderRadius: '4px', border: '1px solid #ccc' }}>
                Send Test Alert
              </button>

            </div>

            <div style={{ padding: '20px', border: '2px solid #e63946', borderRadius: '8px', backgroundColor: '#fff5f5', marginTop: '30px' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#d00000' }}>Emergency Override</h4>
              <button
                onClick={simulateSepsis}
                style={{ 
                  padding: '15px 20px', fontSize: '16px', backgroundColor: '#e63946', 
                  color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', 
                  width: '100%', fontWeight: 'bold' 
                }}
              >
                🚨 Simulate Sepsis Alert
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Alert History</h3>
              {alerts.length > 0 && (
                <button onClick={clearAlerts} style={{ padding: '5px 10px', fontSize: '12px', cursor: 'pointer', borderRadius: '4px', border: '1px solid #ccc' }}>
                  Clear All
                </button>
              )}
            </div>
            
            {alerts.length === 0 ? (
              <p style={{ color: '#888', fontStyle: 'italic', textAlign: 'center', marginTop: '40px' }}>No alerts logged yet.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {alerts.map(alert => (
                  <li key={alert.id} style={{ 
                    padding: '15px', borderBottom: '1px solid #eee', backgroundColor: '#fff', 
                    marginBottom: '10px', borderRadius: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' 
                  }}>
                    <div style={{ fontSize: '12px', color: '#888', marginBottom: '5px' }}>{alert.time}</div>
                    <div style={{ 
                      fontWeight: alert.text.includes('SEVERE') ? 'bold' : 'normal', 
                      color: alert.text.includes('SEVERE') ? '#d00000' : '#333' 
                    }}>
                      {alert.text}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
