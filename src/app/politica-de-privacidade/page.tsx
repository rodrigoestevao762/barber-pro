import { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ShieldCheck, Lock, Eye, FileText, CheckCircle2, Mail, Phone, MapPin } from "lucide-react";
import { LogoMrBastos } from "@/components/LogoMrBastos";

export const metadata: Metadata = {
  title: "Política de Privacidade e Proteção de Dados (LGPD) | Mr. Bastos Barbearia",
  description: "Entenda como a Mr. Bastos Barbearia protege e respeita a privacidade de seus dados pessoais em total conformidade com a LGPD (Lei 13.709/2018).",
};

export default function PoliticaPrivacidadePage() {
  return (
    <div className="min-h-screen bg-[#050B14] text-white selection:bg-blue-600 selection:text-white font-sans">
      {/* Topo / Barra Superior */}
      <header className="border-b border-white/10 bg-[#091220]/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-400 hover:text-blue-400 transition-colors font-semibold"
          >
            <ChevronLeft className="w-4 h-4" /> Voltar ao Início
          </Link>

          <Link href="/" className="flex items-center gap-2.5">
            <LogoMrBastos size={32} color="#3B82F6" />
            <span className="text-lg font-serif tracking-[0.25em] text-white uppercase">MR. BASTOS</span>
          </Link>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        {/* Cabeçalho */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-600/10 border border-blue-500/30 text-blue-400 text-xs font-semibold uppercase tracking-widest mb-4">
            <ShieldCheck className="w-4 h-4" /> Lei Geral de Proteção de Dados (LGPD)
          </div>
          <h1 className="text-3xl md:text-5xl font-serif text-white tracking-tight leading-tight mb-4">
            Política de Privacidade & Termos de Proteção de Dados
          </h1>
          <p className="text-gray-400 text-sm md:text-base font-light max-w-2xl mx-auto leading-relaxed">
            Na <strong>Mr. Bastos Barbearia</strong>, a sua confiança é sagrada. Explicamos aqui com total clareza e transparência como seus dados são protegidos em conformidade rigorosa com a <strong>Lei Federal nº 13.709/2018 (LGPD)</strong>.
          </p>
          <p className="text-gray-500 text-xs mt-3">Última atualização: Outubro de 2026</p>
        </div>

        {/* Artigos e Cláusulas */}
        <div className="space-y-10 text-gray-300 text-sm md:text-base leading-relaxed">
          
          {/* Seção 1 */}
          <section className="p-6 md:p-8 rounded-3xl bg-[#091220] border border-white/5 space-y-4">
            <h2 className="text-xl md:text-2xl font-serif text-white flex items-center gap-3">
              <span className="text-blue-400 font-mono text-lg font-bold">01.</span>
              Quem Somos e Compromisso com a Privacidade
            </h2>
            <p className="text-gray-400 font-light leading-relaxed">
              A <strong>Mr. Bastos Barbearia</strong>, localizada no Hiper Gbarbosa em Alagoinhas - BA, atua como controladora dos dados pessoais fornecidos pelos clientes e profissionais cadastrados através deste site e aplicativo móvel (PWA). Temos o compromisso irrevogável de manter a confidencialidade e segurança de cada informação coletada.
            </p>
          </section>

          {/* Seção 2 */}
          <section className="p-6 md:p-8 rounded-3xl bg-[#091220] border border-white/5 space-y-4">
            <h2 className="text-xl md:text-2xl font-serif text-white flex items-center gap-3">
              <span className="text-blue-400 font-mono text-lg font-bold">02.</span>
              Quais Dados Coletamos
            </h2>
            <p className="text-gray-400 font-light">
              Coletamos estritamente os dados essenciais para viabilizar a experiência de atendimento e gestão na barbearia:
            </p>
            <ul className="space-y-2.5 pt-2">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <span><strong>Nome Completo:</strong> Para identificação na recepção e organização da agenda do barbeiro escolhido.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <span><strong>Telefone / WhatsApp (com DDD):</strong> Para envio de confirmações de horário, lembretes de agendamento e suporte direto.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <span><strong>E-mail:</strong> Para autenticação segura, envio de comprovantes e links de recuperação de senha via Resend.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <span><strong>Senha Criptografada:</strong> Protegida em nosso banco de dados por funções de dispersão unidirecionais (hash irreversível). Ninguém, nem mesmo nossos administradores, tem acesso à sua senha original.</span>
              </li>
            </ul>
          </section>

          {/* Seção 3 */}
          <section className="p-6 md:p-8 rounded-3xl bg-[#091220] border border-white/5 space-y-4">
            <h2 className="text-xl md:text-2xl font-serif text-white flex items-center gap-3">
              <span className="text-blue-400 font-mono text-lg font-bold">03.</span>
              Finalidade do Tratamento (Art. 7º, V da LGPD)
            </h2>
            <p className="text-gray-400 font-light">
              Todos os dados pessoais são utilizados com fundamento no cumprimento do contrato de prestação de serviços de barbearia (execução de agendamento) e no legítimo interesse do titular:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-gray-400 text-sm">
              <li>Reserva e garantia de vaga com o barbeiro na data e horário marcados;</li>
              <li>Histórico de cortes e serviços para controle do plano de fidelidade do cliente;</li>
              <li>Comunicação operacional rápida via WhatsApp caso ocorra imprevisto;</li>
              <li>Controle de comissões justas e transparentes aos barbeiros parceiros.</li>
            </ul>
          </section>

          {/* Seção 4 */}
          <section className="p-6 md:p-8 rounded-3xl bg-[#091220] border border-white/5 space-y-4">
            <h2 className="text-xl md:text-2xl font-serif text-white flex items-center gap-3">
              <Lock className="w-6 h-6 text-blue-400" />
              04. Segurança da Informação e Criptografia
            </h2>
            <p className="text-gray-400 font-light leading-relaxed">
              Adotamos medidas técnicas de segurança de ponta para proteger seus dados contra acessos não autorizados, perdas ou adulterações:
            </p>
            <ul className="space-y-2 pt-2">
              <li className="flex items-center gap-3 text-sm">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span><strong>Tráfego 100% Criptografado (HTTPS / SSL):</strong> Toda comunicação entre o seu navegador/celular e os servidores é criptografada com certificados de segurança modernos.</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span><strong>Isolamento de Contas (Multi-tenant):</strong> Cada cliente acessa estritamente seu próprio painel, e cada barbeiro visualiza apenas seus respectivos atendimentos.</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span><strong>Proteção Anti-Spam & DKIM/SPF:</strong> Nossos e-mails institucionais são autenticados via chaves criptográficas DKIM e CNAME dedicados no provedor Resend.</span>
              </li>
            </ul>
          </section>

          {/* Seção 5 */}
          <section className="p-6 md:p-8 rounded-3xl bg-[#091220] border border-white/5 space-y-4">
            <h2 className="text-xl md:text-2xl font-serif text-white flex items-center gap-3">
              <Eye className="w-6 h-6 text-blue-400" />
              05. Sigilo Absoluto e Não Compartilhamento
            </h2>
            <p className="text-gray-400 font-light leading-relaxed">
              <strong>Nós NUNCA vendemos, alugamos ou transferimos seus dados pessoais para empresas de marketing, publicidade ou terceiros.</strong> Seus dados são de uso estrito e exclusivo do ecossistema da Mr. Bastos Barbearia para operacionalizar seus agendamentos.
            </p>
          </section>

          {/* Seção 6 */}
          <section className="p-6 md:p-8 rounded-3xl bg-[#091220] border border-white/5 space-y-4">
            <h2 className="text-xl md:text-2xl font-serif text-white flex items-center gap-3">
              <span className="text-blue-400 font-mono text-lg font-bold">06.</span>
              Seus Direitos como Titular (Art. 18 da LGPD)
            </h2>
            <p className="text-gray-400 font-light">
              Você tem total controle sobre seus dados pessoais e pode, a qualquer momento e sem custos:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <strong className="text-white block text-sm mb-1">Acesso e Confirmação:</strong>
                <span className="text-xs text-gray-400">Ver todos os dados e histórico armazenados no seu Painel VIP.</span>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <strong className="text-white block text-sm mb-1">Correção:</strong>
                <span className="text-xs text-gray-400">Atualizar telefone, e-mail ou nome sempre que desejar.</span>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <strong className="text-white block text-sm mb-1">Exclusão Definitiva:</strong>
                <span className="text-xs text-gray-400">Solicitar a remoção completa da sua conta e registros da nossa base.</span>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <strong className="text-white block text-sm mb-1">Revogação de Consentimento:</strong>
                <span className="text-xs text-gray-400">Parar de receber qualquer notificação institucional.</span>
              </div>
            </div>
          </section>

          {/* Seção 7 */}
          <section className="p-6 md:p-8 rounded-3xl bg-[#091220] border border-white/5 space-y-4">
            <h2 className="text-xl md:text-2xl font-serif text-white flex items-center gap-3">
              <FileText className="w-6 h-6 text-blue-400" />
              07. Política de Cookies e Aplicativo Móvel (PWA)
            </h2>
            <p className="text-gray-400 font-light leading-relaxed">
              Nosso site e aplicativo móvel (PWA) utilizam apenas <strong>cookies estritamente necessários</strong> e recursos de armazenamento local (LocalStorage / SessionStorage) para manter sua sessão conectada com segurança, lembrar suas preferências de navegação e viabilizar o funcionamento offline do aplicativo. Não utilizamos cookies invasivos de rastreamento entre sites terceiros.
            </p>
          </section>

          {/* Seção 8 */}
          <section className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-blue-950/40 via-[#091220] to-[#091220] border border-blue-500/30 space-y-4">
            <h2 className="text-xl md:text-2xl font-serif text-white flex items-center gap-3">
              <span className="text-blue-400 font-mono text-lg font-bold">08.</span>
              Canal de Atendimento do Titular (DPO / Suporte)
            </h2>
            <p className="text-gray-400 font-light leading-relaxed">
              Para exercer qualquer um dos seus direitos de titular, solicitar exclusão de dados ou esclarecer qualquer dúvida sobre esta política, fale diretamente com nossa equipe encarregada:
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <a
                href="https://wa.me/5575998679820?text=Ol%C3%A1!%20Gostaria%20de%20tirar%20uma%20d%C3%BAvida%20sobre%20privacidade%20e%20meus%20dados%20na%20Mr.%20Bastos."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/40 text-emerald-400 transition-all text-xs font-semibold"
              >
                <Phone className="w-4 h-4" /> (75) 99867-9820 (WhatsApp Oficial)
              </a>
              <a
                href="mailto:contato@mrbastos.com.br"
                className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/40 text-blue-400 transition-all text-xs font-semibold"
              >
                <Mail className="w-4 h-4" /> contato@mrbastos.com.br
              </a>
            </div>
            <p className="text-xs text-gray-500 pt-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-400" /> Mr. Bastos Barbearia · Hiper Gbarbosa · Av. Dantas Bião, Alagoinhas - BA
            </p>
          </section>

        </div>

        {/* Rodapé da página */}
        <div className="mt-16 pt-8 border-t border-white/10 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all"
          >
            Voltar à Página Principal
          </Link>
        </div>
      </main>
    </div>
  );
}
