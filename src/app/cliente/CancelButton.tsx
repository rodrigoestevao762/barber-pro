"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { XCircle } from "lucide-react";

export default function CancelButton({ id, serviceName, dateStr }: { id: string, serviceName: string, dateStr: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCancel = async () => {
    if (!confirm("Tem certeza que deseja cancelar este agendamento?")) return;
    setLoading(true);
    
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "CANCELLED" })
      });
      
      if (res.ok) {
        // Enviar aviso pro whatsapp
        const msg = encodeURIComponent(`Olá! Infelizmente precisei cancelar meu agendamento de ${serviceName} para o dia ${dateStr}. A vaga está liberada!`);
        window.open(`https://wa.me/5511999999999?text=${msg}`, "_blank");
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleCancel} disabled={loading}
      className="text-red-400 hover:text-red-300 transition-colors flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold ml-4 disabled:opacity-50"
    >
      <XCircle className="w-4 h-4" />
      {loading ? "Cancelando..." : "Cancelar"}
    </button>
  );
}

