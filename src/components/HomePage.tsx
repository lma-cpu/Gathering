import { useState } from "react";
import { useLocation } from "wouter";
import { Copy, Plus, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function HomePage() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [createdUrl, setCreatedUrl] = useState("");
  
  const [form, setForm] = useState({
    creatorName: "",
    city: "",
    title: "",
    dateRange: ""
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.creatorName || !form.city) return;
    setLoading(true);
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.id) {
        setCreatedUrl(`${window.location.origin}/hangout/${data.id}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
      <div className="space-y-4">
        <h2 className="text-3xl tracking-tight text-zinc-900">Initiate.</h2>
        <p className="text-zinc-500 max-w-sm leading-relaxed">
          Establish the parameters. Share the link. Let the intelligence synthesize the final outcome.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!createdUrl ? (
          <motion.form key="form" exit={{ opacity: 0, y: -10 }} onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
              <div className="border border-zinc-200 bg-white p-6 space-y-4 shadow-sm">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-mono text-zinc-500 mb-2">Initiator Identity *</label>
                  <input required placeholder="E.g. Alex" className="w-full bg-transparent border-b border-zinc-200 outline-none focus:border-zinc-900 py-2 transition-colors placeholder:text-zinc-300" 
                    value={form.creatorName} onChange={e => setForm({...form, creatorName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-mono text-zinc-500 mb-2">Target Coordinates (City) *</label>
                  <input required placeholder="E.g. Seattle, WA" className="w-full bg-transparent border-b border-zinc-200 outline-none focus:border-zinc-900 py-2 transition-colors placeholder:text-zinc-300"
                    value={form.city} onChange={e => setForm({...form, city: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-mono text-zinc-500 mb-2">Codename (Optional)</label>
                  <input placeholder="E.g. Project Sushi" className="w-full bg-transparent border-b border-zinc-200 outline-none focus:border-zinc-900 py-2 transition-colors placeholder:text-zinc-300"
                    value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-mono text-zinc-500 mb-2">Temporal Range (Optional)</label>
                  <input placeholder="E.g. This Weekend, Oct 24-25" className="w-full bg-transparent border-b border-zinc-200 outline-none focus:border-zinc-900 py-2 transition-colors placeholder:text-zinc-300"
                    value={form.dateRange} onChange={e => setForm({...form, dateRange: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <button disabled={loading || !form.creatorName || !form.city} className="bg-zinc-900 text-white font-mono text-sm px-6 py-3 w-full sm:w-auto hover:bg-zinc-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Generate Directive
            </button>
          </motion.form>
        ) : (
          <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="border border-zinc-200 bg-white p-6 shadow-sm flex flex-col items-center justify-center space-y-4 py-12 text-center">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <h3 className="font-mono text-lg">Uplink Established</h3>
              <p className="text-zinc-500 text-sm max-w-xs">Share this exact coordinates link with your targets to collect telemetry.</p>
              
              <div className="flex items-center gap-2 mt-4 bg-zinc-50 border border-zinc-200 p-2 w-full max-w-md">
                <code className="text-xs text-zinc-600 truncate flex-1 block px-2">{createdUrl}</code>
                <button onClick={() => navigator.clipboard.writeText(createdUrl)} className="p-2 hover:bg-zinc-200 transition-colors shrink-0 tooltip" title="Copy">
                  <Copy className="w-4 h-4 text-zinc-600" />
                </button>
              </div>
            </div>
            
            <button onClick={() => setLocation(new URL(createdUrl).pathname)} className="text-sm font-mono text-zinc-500 hover:text-zinc-900 flex items-center gap-2 mx-auto decoration-1 underline underline-offset-4">
              Enter Session
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
