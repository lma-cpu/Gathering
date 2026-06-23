import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "motion/react";
import { Loader2, Download, ExternalLink, Calendar, MapPin, Cloud, Lock } from "lucide-react";

export default function HangoutPage({ params }: { params: { id: string } }) {
  const [session, setSession] = useState<any>(null);
  const [responses, setResponses] = useState<any[]>([]);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [synthesizing, setSynthesizing] = useState(false);
  const [summitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    friendName: "",
    availableSlots: [] as string[],
    chosenVibes: [] as string[]
  });

  const slots = ["Friday Eve", "Saturday Morn", "Saturday Aft", "Saturday Eve", "Sunday Morn", "Sunday Aft", "Sunday Eve"];
  const vibes = ["#AestheticCafe", "#CozyDinner", "#BarNight", "#OutdoorPark", "#Museum", "#ActiveEnergy"];

  useEffect(() => {
    fetchSession();
  }, [params.id]);

  async function fetchSession() {
    try {
      const res = await fetch(`/api/sessions/${params.id}`);
      if (!res.ok) return;
      const data = await res.json();
      setSession(data.session);
      setResponses(data.responses);
      setResult(data.result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function submitResponse(e: React.FormEvent) {
    e.preventDefault();
    if (!form.friendName) return;
    setSubmitting(true);
    try {
      await fetch(`/api/sessions/${params.id}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      setForm({ friendName: "", availableSlots: [], chosenVibes: [] });
      await fetchSession();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  }

  async function triggerSynthesis() {
    setSynthesizing(true);
    try {
      const res = await fetch(`/api/sessions/${params.id}/synthesize`, {
        method: "POST"
      });
      await fetchSession();
    } catch (e) {
      console.error(e);
    } finally {
      setSynthesizing(false);
    }
  }

  function generateIcs() {
    if (!result) return;
    const startStr = result.selectedDate + " " + result.selectedTime;
    const icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:${session.title || 'GatherMin Hangout'}\nLOCATION:${result.venueName}, ${result.venueAddress}, ${session.city}\nDESCRIPTION:${result.aiReasoning}\nEND:VEVENT\nEND:VCALENDAR`;
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'hangout.ics';
    link.click();
  }

  if (loading) return <div className="flex justify-center py-24"><Loader2 className="animate-spin text-zinc-300 w-6 h-6" /></div>;
  if (!session) return <div className="py-24 text-center text-zinc-500 font-mono text-sm">Session not found.</div>;

  const isFinalized = session.status === 'finalized' && result;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
      
      {!isFinalized ? (
        <>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="font-mono text-xs uppercase tracking-widest text-zinc-500">Live Collection Mode</span>
            </div>
            <h2 className="text-3xl tracking-tight text-zinc-900">{session.title || 'Target Selection'}</h2>
            <p className="text-zinc-500 text-sm max-w-sm">
              Initiator {session.creatorName} is requesting telemetry for {session.city}. 
              {session.dateRange && ` Target window: ${session.dateRange}.`}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <form onSubmit={submitResponse} className="space-y-8 bg-white border border-zinc-200 p-6 shadow-sm">
              <div>
                <label className="block text-xs uppercase tracking-wider font-mono text-zinc-500 mb-3">Your Identity *</label>
                <input required placeholder="E.g. Sam" className="w-full bg-transparent border-b border-zinc-200 outline-none focus:border-zinc-900 py-2 transition-colors placeholder:text-zinc-300 mb-6" 
                  value={form.friendName} onChange={e => setForm({...form, friendName: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-mono text-zinc-500 mb-3">Temporal Availability</label>
                <div className="flex flex-wrap gap-2">
                  {slots.map(slot => (
                    <button type="button" key={slot}
                      onClick={() => setForm(prev => ({
                        ...prev,
                        availableSlots: prev.availableSlots.includes(slot) ? prev.availableSlots.filter(s => s !== slot) : [...prev.availableSlots, slot]
                      }))}
                      className={`px-3 py-1.5 text-xs font-mono border transition-colors ${form.availableSlots.includes(slot) ? 'bg-zinc-900 border-zinc-900 text-white' : 'bg-transparent border-zinc-200 text-zinc-600 hover:border-zinc-400'}`}>
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-mono text-zinc-500 mb-3">Vibe Resonance</label>
                <div className="flex flex-wrap gap-2">
                  {vibes.map(vibe => (
                    <button type="button" key={vibe}
                      onClick={() => setForm(prev => ({
                        ...prev,
                        chosenVibes: prev.chosenVibes.includes(vibe) ? prev.chosenVibes.filter(v => v !== vibe) : [...prev.chosenVibes, vibe]
                      }))}
                      className={`px-3 py-1.5 text-xs font-mono border transition-colors ${form.chosenVibes.includes(vibe) ? 'bg-zinc-900 border-zinc-900 text-white' : 'bg-transparent border-zinc-200 text-zinc-600 hover:border-zinc-400'}`}>
                      {vibe}
                    </button>
                  ))}
                </div>
              </div>

              <button disabled={summitting || !form.friendName} className="w-full bg-zinc-100 text-zinc-900 font-mono text-sm py-3 transition-colors hover:bg-zinc-200 disabled:opacity-50 flex items-center justify-center gap-2">
                {summitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Transmit Telemetry'}
              </button>
            </form>

            <div className="space-y-6">
              <div className="bg-zinc-100 p-6 border border-zinc-200">
                <h3 className="font-mono text-xs uppercase tracking-wider text-zinc-500 mb-4">Confirmed Telemetry ({responses.length})</h3>
                <div className="space-y-4">
                  {responses.length === 0 ? <p className="text-zinc-400 text-sm italic">Silence...</p> : null}
                  {responses.map((r, i) => (
                    <div key={i} className="bg-white p-3 border border-zinc-200 text-sm">
                      <span className="font-medium text-zinc-900 font-mono">{r.friendName}</span>
                      <p className="text-zinc-500 text-xs mt-1 leading-relaxed">
                        Slots: {r.availableSlots.length > 0 ? r.availableSlots.join(', ') : 'None'}<br/>
                        Vibes: {r.chosenVibes.length > 0 ? r.chosenVibes.join(', ') : 'None'}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-zinc-200">
                   <p className="text-xs text-zinc-500 mb-4">Creator Control Override</p>
                   <button onClick={triggerSynthesis} disabled={synthesizing || responses.length === 0} className="w-full bg-zinc-900 text-white font-mono text-sm py-3 transition-colors hover:bg-zinc-800 disabled:opacity-50 flex items-center justify-center gap-2">
                    {synthesizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Lock className="w-4 h-4 mb-0.5" /> Lock & Synthesize</>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="max-w-xl mx-auto space-y-6">
           <div className="text-center space-y-2 mb-8">
              <span className="font-mono text-xs uppercase tracking-widest text-zinc-500">Operation Finalized</span>
              <h2 className="text-3xl tracking-tight text-zinc-900 pt-2">{session.title || 'GatherMin Output'}</h2>
           </div>

           <div className="bg-white border text-center border-zinc-200 p-8 md:p-12 shadow-sm space-y-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-zinc-900" />
              
              <div className="space-y-2 text-center">
                <div className="flex items-center justify-center gap-2 text-zinc-500 font-mono uppercase tracking-widest text-xs mb-2">
                  <Calendar className="w-4 h-4" /> Locked Temporal Window
                </div>
                <div className="text-2xl font-medium tracking-tight text-zinc-900">{result.selectedDate}</div>
                <div className="text-zinc-500">{result.selectedTime}</div>
              </div>

              <div className="h-px bg-zinc-100 w-1/2 mx-auto" />

              <div className="space-y-4">
                 <div className="flex items-center justify-center gap-2 text-zinc-500 font-mono uppercase tracking-widest text-xs mb-2">
                  <MapPin className="w-4 h-4" /> Locked Target Vector
                 </div>
                 <a href={result.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="group inline-block w-full">
                    <div className="bg-zinc-50 border border-zinc-200 p-4 transition-colors group-hover:bg-zinc-100 group-hover:border-zinc-300">
                       <span className="block text-xl font-medium text-zinc-900 mb-1">{result.venueName}</span>
                       <span className="block text-zinc-500 text-sm mb-3">{result.venueAddress}, {session.city}</span>
                       <span className="inline-flex items-center gap-1 text-xs font-mono text-zinc-600 bg-white px-2 py-1 border border-zinc-200 shadow-sm leading-none">
                         Navigate <ExternalLink className="w-3 h-3" />
                       </span>
                    </div>
                 </a>
              </div>

              <div className="h-px bg-zinc-100 w-1/2 mx-auto" />

              <div className="grid grid-cols-2 gap-4 text-left">
                 <div className="bg-zinc-50 border border-zinc-200 p-4">
                    <div className="flex items-center gap-2 text-zinc-500 font-mono uppercase tracking-widest text-[10px] mb-2">
                       <Cloud className="w-3 h-3" /> Atmosphere
                    </div>
                    <div className="text-sm text-zinc-800">{result.weatherCondition}</div>
                 </div>
                 <div className="bg-zinc-50 border border-zinc-200 p-4">
                    <div className="flex items-center gap-2 text-zinc-500 font-mono uppercase tracking-widest text-[10px] mb-2">
                       <Loader2 className="w-3 h-3" /> Synthesis Logic
                    </div>
                    <div className="text-xs text-zinc-600 leading-relaxed">{result.aiReasoning}</div>
                 </div>
              </div>
           </div>

           <button onClick={generateIcs} className="w-full bg-zinc-900 text-white font-mono text-sm py-4 transition-colors hover:bg-zinc-800 flex items-center justify-center gap-2 mt-4">
              <Download className="w-4 h-4 mb-0.5" /> Save to Calendar Array
           </button>
        </div>
      )}

    </motion.div>
  );
}
