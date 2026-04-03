import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { motion } from 'framer-motion';
import ScrollReveal from './ScrollReveal';
import TextReveal from './TextReveal';
import FreemiCharacter from './FreemiCharacter';

const faqs = [
  { q: 'What is Freemi?', a: 'Freemi is your AI chief executive. Tell it your goals and it hires the right agents to make sure you meet them — handling sales, support, engineering, and operations autonomously. No micromanagement needed.' },
  { q: 'Who are the agents?', a: 'Rex handles sales (lead qualification, follow-ups, booking), Dev handles engineering (bug triage, PR coordination, sprints), Echo handles support (tickets, docs, escalations), and Nova handles operations (invoicing, reporting, data). Freemi orchestrates them all.' },
  { q: 'How is this different from ChatGPT or other AI tools?', a: "Those tools help you write faster. Freemi runs your business. Your agents connect to real tools — Gmail, Slack, GitHub, HubSpot, Jira — and execute complete workflows end-to-end without supervision." },
  { q: 'Is my data safe?', a: 'Absolutely. SOC 2 compliant, encrypted in transit and at rest, and your data is never used to train models. Full audit trails on every action every agent takes.' },
  { q: 'Do I need to know how to code?', a: 'Nope. Setup takes about 60 seconds. Connect your tools, describe your goals, and your agent team starts working. We also offer free onboarding calls if you want a hand.' },
  { q: 'What happens during the free trial?', a: 'You get full access for 3 days — no credit card required. Deploy all five agents, connect your tools, and see real results before you commit.' },
  { q: 'Can I cancel anytime?', a: 'Yes, zero contracts, zero cancellation fees. You can pause or cancel your subscription at any time from your Freemi dashboard.' },
];

export default function FAQSection() {
  return (
    <section id="faq" className="relative py-32 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <ScrollReveal>
            <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase px-4 py-1.5 rounded-full mb-5"
              style={{ color: '#059669', background: 'rgba(5,150,105,0.06)', border: '1px solid rgba(5,150,105,0.1)' }}>
              FAQ
            </span>
          </ScrollReveal>
          <TextReveal delay={0.1}>
            <h2 className="text-[clamp(2.2rem,5vw,3.8rem)] font-extrabold tracking-[-0.03em] text-surface leading-[1.08]">
              Got Questions? Freemi Has Answers.
            </h2>
          </TextReveal>
          <ScrollReveal delay={0.2}>
            <div className="flex justify-center mt-3 mb-1">
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                className="relative">
                <FreemiCharacter size="sm" />
                {/* Speech bubble */}
                <motion.div
                  animate={{ opacity: [0.8, 1, 0.8], scale: [0.98, 1, 0.98] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -top-5 -right-16 px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap"
                  style={{ background: '#fff', border: '1px solid rgba(91,95,255,0.15)', color: '#5B5FFF', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
                  Ask me! 👋
                </motion.div>
              </motion.div>
            </div>
            <p className="text-gray-500 mt-3 text-lg">Everything you need to know before deploying your AI CEO.</p>
          </ScrollReveal>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <ScrollReveal key={i} delay={i * 0.05}>
              <AccordionItem value={`item-${i}`}
                className="rounded-2xl px-6 bg-white/80 backdrop-blur-sm transition-all duration-300 overflow-hidden"
                style={{
                  border: '1px solid rgba(0,0,0,0.06)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                }}>
                <AccordionTrigger className="text-surface font-semibold text-left hover:no-underline hover:text-[#5B5FFF] transition-colors py-5 text-sm">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-gray-500 text-sm leading-relaxed pb-5">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            </ScrollReveal>
          ))}
        </Accordion>
      </div>
    </section>
  );
}