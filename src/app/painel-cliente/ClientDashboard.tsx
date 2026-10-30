"use client";

import { motion } from "framer-motion";
import { Scissors, Calendar, Clock, RotateCcw, User, LogOut, Award, Star, CheckCircle, Sparkles, MessageCircle, MapPin, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import BookingModal from "@/components/BookingModal";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LogoMrBastos } from "@/components/LogoMrBastos";
import { BARBERS, getBarberById } from "@/lib/barbers";

export default function ClientDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | undefined>(undefined);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loyalty, setLoyalty] = useState({ currentCuts: 0, targetCuts: 10, freeCutsWon: 0 });
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("Olá");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting("Bom dia");
    } else if (hour >= 12 && hour < 18) {
      setGreeting("Boa tarde");
    } else {
      setGreeting("Boa noite");
    }
  }, []);

  const [clientData, setClientData] = useState<{
    name: string;
    email: string;
    phone: string;
  }>({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    phone: (session?.user as any)?.phone || "",
  });

  // Redireciona para o login se não estiver autenticado
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      setClientData((prev) => ({
        name: session.user?.name || prev.name,
        email: session.user?.email || prev.email,
        phone: (session.user as any)?.phone || prev.phone,
      }));
    }
  }, [session]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/dashboard")
        .then((res) => res.json())
        .then((data) => {
          if (data.isClient) {
            if (data.client) {
              setClientData({
                name: data.client.name || "",
                email: data.client.email || "",
                phone: data.client.phone || "",
              });
            }
            if (data.appointments) {
              const sorted = data.appointments.sort(
                (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
              );
              setAppointments(sorted);
            }
            if (data.loyaltyCard) {
              setLoyalty(data.loyaltyCard);
            }
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status]);

  const clientName = clientData.name || session?.user?.name || "Cliente VIP";
  const clientPhone = clientData.phone || (session?.user as any)?.phone || "";
  const clientEmail = clientData.email || session?.user?.email || "";
  const vipDigits = clientPhone ? clientPhone.replace(/\D/g, "").slice(-4) : "VIP";

  // Próximo agendamento futuro
  const upcomingApt = appointments.find(
    (apt) => new Date(apt.date) >= new Date() && apt.status !== "CANCELLED"
  );

  // Último agendamento concluído ou passado
  const lastApt = appointments.find(
    (apt) => new Date(apt.date) < new Date() || apt.status === "COMPLETED"
  ) || appointments[0];

  const handleRebook = () => {
    if (lastApt) {
      const barberPhone = lastApt.barber?.phone || BARBERS[0].phone;
      const barberName = lastApt.barber?.name || BARBERS[0].name;
      const serviceName = lastApt.service?.name || "Corte";
      const msg = `Olá, ${barberName}! Sou o ${clientName}. Gostaria de repetir o meu último ${serviceName} com você. Quais horários você tem disponíveis nos próximos dias na Mr. Bastos Barbearia?`;
      window.open(`https://wa.me/${barberPhone}?text=${encodeURIComponent(msg)}`, "_blank");
    } else {
      setIsModalOpen(true);
    }
  };

  const handleContactBarber = (barberPhone?: string, barberName?: string) => {
    const phone = barberPhone || BARBERS[0].phone;
    const name = barberName || BARBERS[0].name;
    const msg = `Olá, ${name}! Sou o ${clientName}, cliente da Mr. Bastos Barbearia. Gostaria de tirar uma dúvida sobre meu horário.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#02050A] text-white selection:bg-[#C88E70] selection:text-black">
      {/* ── HEADER DO CLIENTE ── */}
      <header className="border-b border-white/5 bg-[#050B14]/90 sticky top-0 z-40 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <LogoMrBastos size={36} color="#C88E70" />
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#C88E70] font-semibold">
                Painel do Cliente
              </p>
              <h1 className="text-xl font-serif text-white">{greeting}, {clientName}</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold bg-[#C88E70]/15 text-[#C88E70] border border-[#C88E70]/30">
              <Star className="w-3 h-3 fill-[#C88E70]" /> Cliente VIP
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-gray-400 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider p-2 rounded-lg hover:bg-white/5"
            >
              <LogOut className="w-4 h-4" /> Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        {loading ? (
          <div className="py-24 text-center text-[#C88E70] animate-pulse font-serif text-lg tracking-widest uppercase">
            Carregando seus dados...
          </div>
        ) : (
          <>
            {/* ── CARD 1: DADOS DO CLIENTE ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#C88E70]/15 border border-[#C88E70]/30 flex items-center justify-center text-[#C88E70] font-serif text-2xl font-bold">
                  {clientName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-serif text-white">{clientName}</h2>
                    <span className="text-[10px] bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full font-bold uppercase">
                      Conta Ativa
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    WhatsApp: <span className="text-white font-mono">{clientPhone}</span> · E-mail: <span className="text-white">{clientEmail}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedServiceId(undefined);
                  setIsModalOpen(true);
                }}
                className="w-full sm:w-auto bg-[#C88E70] text-[#050B14] hover:bg-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-[#C88E70]/20 shrink-0"
              >
                <Scissors className="w-4 h-4" /> + Novo Agendamento
              </button>
            </motion.div>

            {/* ── CARD 2: PRÓXIMO HORÁRIO DE SERVIÇO (SE HOUVER) ── */}
            {upcomingApt && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-[#C88E70]/20 via-white/[0.02] to-transparent border border-[#C88E70]/40 rounded-3xl p-6 md:p-8 relative overflow-hidden"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-ping" />
                      <span className="text-xs font-semibold uppercase tracking-widest text-[#C88E70]">
                        Seu Próximo Horário Agendado
                      </span>
                    </div>
                    <h3 className="text-3xl font-serif text-white mb-2">
                      {upcomingApt.service?.name} · R$ {upcomingApt.service?.price}
                    </h3>
                    <p className="text-sm text-gray-300 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#C88E70]" />
                      <strong>
                        {new Date(upcomingApt.date).toLocaleDateString("pt-BR")} às{" "}
                        {new Date(upcomingApt.date).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </strong>
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      Barbeiro responsável: <strong className="text-white">{upcomingApt.barber?.name || "Mr. Bastos (Dono)"}</strong> · Local: Hiper Gbarbosa, Alagoinhas BA
                    </p>
                  </div>

                  <button
                    onClick={() => handleContactBarber(upcomingApt.barber?.phone, upcomingApt.barber?.name)}
                    className="w-full md:w-auto bg-[#25D366] text-white px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#128C7E] transition-all"
                  >
                    <MessageCircle className="w-4 h-4" /> Falar com o Barbeiro
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── CARD 3: OPÇÃO DE REMARCAR / REPETIR ÚLTIMO CORTE ── */}
            {lastApt && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden"
              >
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">
                    Último Atendimento Realizado
                  </span>
                  <h3 className="text-2xl font-serif text-white mt-1">
                    Quer repetir o mesmo corte?
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 max-w-md leading-relaxed">
                    Você fez <strong className="text-white">{lastApt.service?.name}</strong> com <strong className="text-white">{lastApt.barber?.name || "Mr. Bastos"}</strong> no dia {new Date(lastApt.date).toLocaleDateString("pt-BR")}. Clique ao lado para agendar diretamente com ele.
                  </p>
                </div>

                <button
                  onClick={handleRebook}
                  className="w-full md:w-auto bg-[#C88E70] text-[#050B14] hover:bg-white px-6 py-3.5 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all duration-300 shadow-md shrink-0 hover:scale-[1.02]"
                >
                  <RotateCcw className="w-4 h-4" /> Remarcar Último Corte
                </button>
              </motion.div>
            )}

            {/* ── A OUTRA COISA ÓTIMA: CARTÃO FIDELIDADE DIGITAL VIP MR. BASTOS ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-[#101927] via-[#050B14] to-[#02050A] border-2 border-[#C88E70]/40 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl"
            >
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#C88E70]/10 blur-3xl rounded-full pointer-events-none" />

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-white/10 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#C88E70]/20 flex items-center justify-center text-[#C88E70] border border-[#C88E70]/40">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-[#C88E70] font-bold">
                      Benefício Exclusivo
                    </p>
                    <h3 className="text-xl md:text-2xl font-serif text-white">
                      Cartão Fidelidade Digital Mr. Bastos
                    </h3>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[10px] uppercase tracking-wider text-gray-500 font-mono">
                    ID VIP:
                  </span>
                  <p className="text-xs font-mono font-bold text-white tracking-widest">
                    MRB-{vipDigits}
                  </p>
                </div>
              </div>

              {/* Regra da promoção */}
              <p className="text-xs text-gray-300 font-light mb-6 relative z-10 leading-relaxed">
                🎉 <strong>A cada 9 cortes realizados, o 10º é por conta da casa!</strong> Apresente seu número no balcão ao finalizar para acumular selos.
              </p>

              {/* 10 Carimbos Visuais */}
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2.5 mb-6 relative z-10">
                {Array.from({ length: 10 }).map((_, index) => {
                  const isFilled = index < loyalty.currentCuts;
                  const isTenth = index === 9;

                  return (
                    <div
                      key={index}
                      className={`h-14 rounded-xl border flex flex-col items-center justify-center transition-all ${
                        isFilled
                          ? "bg-[#C88E70] border-[#C88E70] text-[#050B14] shadow-md shadow-[#C88E70]/30 font-bold"
                          : isTenth
                          ? "bg-[#C88E70]/10 border-dashed border-[#C88E70] text-[#C88E70]"
                          : "bg-white/[0.02] border-white/10 text-gray-600"
                      }`}
                    >
                      {isFilled ? (
                        <>
                          <Scissors className="w-4 h-4 mb-0.5" />
                          <span className="text-[9px] font-mono">{index + 1}</span>
                        </>
                      ) : isTenth ? (
                        <>
                          <Sparkles className="w-4 h-4 mb-0.5 text-[#C88E70] animate-pulse" />
                          <span className="text-[8px] uppercase font-bold tracking-tighter">Grátis</span>
                        </>
                      ) : (
                        <span className="text-xs font-mono">{index + 1}</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Barra de Progresso */}
              <div className="space-y-2 relative z-10">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">
                    Progresso: <strong className="text-white">{loyalty.currentCuts} de 10 cortes</strong>
                  </span>
                  <span className="text-[#C88E70] font-semibold">
                    Faltam apenas {10 - loyalty.currentCuts} cortes para o gratuito!
                  </span>
                </div>
                <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-[#C88E70]/80 to-[#C88E70] rounded-full transition-all duration-1000 shadow-[0_0_15px_#C88E70]"
                    style={{ width: `${(loyalty.currentCuts / 10) * 100}%` }}
                  />
                </div>
              </div>
            </motion.div>

            {/* ── CARD 4: REGISTRO / HISTÓRICO DE SERVIÇOS ── */}
            <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 md:p-8">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
                <div>
                  <h3 className="text-xl font-serif text-white">Registro de Serviços (Histórico)</h3>
                  <p className="text-xs text-gray-400 font-light mt-0.5">
                    Todos os seus cortes, barbas e atendimentos registrados.
                  </p>
                </div>
                <span className="text-xs font-mono text-gray-500">
                  {appointments.length} registros
                </span>
              </div>

              {appointments.length === 0 ? (
                <div className="py-12 text-center text-gray-500 text-sm">
                  Nenhum corte registrado ainda. Faça seu primeiro agendamento acima!
                </div>
              ) : (
                <div className="space-y-3">
                  {appointments.map((apt: any) => (
                    <div
                      key={apt.id}
                      className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-white/10 transition-all"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#C88E70]">
                          <Scissors className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-base font-serif text-white">{apt.service?.name}</h4>
                          <p className="text-xs text-gray-400">
                            Atendido por: <strong className="text-gray-300">{apt.barber?.name || "Mr. Bastos (Dono)"}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4">
                        <span className="text-[#C88E70] font-mono text-sm font-bold">
                          R$ {apt.service?.price}
                        </span>
                        <div className="text-right">
                          <p className="text-xs text-gray-300">
                            {new Date(apt.date).toLocaleDateString("pt-BR")}
                          </p>
                          <p className="text-[10px] text-gray-500">
                            {new Date(apt.date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <BookingModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          fetch("/api/dashboard")
            .then((res) => res.json())
            .then((data) => {
              if (data?.isClient && data.appointments) {
                setAppointments(data.appointments);
              }
              if (data?.isClient && data.loyaltyCard) {
                setLoyalty(data.loyaltyCard);
              }
            })
            .catch(() => {});
        }}
        initialServiceId={selectedServiceId}
        initialUserData={clientData}
      />
    </div>
  );
}
