import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { motion } from 'framer-motion';
import ScrollReveal from './ScrollReveal';
import TextReveal from './TextReveal';
import FreemiCharacter from './FreemiCharacter';

const faqs = [
  { q: 'What exactly is an AI operator?', a: 'Think of it as a tireless digital teammate. Unlike chatbots that wait for prompts, Freemi operators proactively handle real tasks — responding to emails, updating your CRM, scheduling meetings, and running multi-step workflows autonomously.' },
  { q: 'What kind of work can Freemi handle?', a: 'Inbox triage, lead qualification, follow-up emails, meeting scheduling, CRM updates, support ticket resolution, daily reporting, and custom workflows across 40+ connected tools.' },
  { q: 'How is this different from ChatGPT or Copilot?', a: "Those tools help you write faster. Freemi does the work for you. It connects to your actual tools — Gmail, Slack, HubSpot, Salesforce — and executes complete workflows end-to-end without supervision." },
  { q: 'Is my data safe?', a: 'Absolutely. SOC 2 compliant, encrypted in transit and at rest, and your data is never used to train models. Full audit trails on every action your operator takes.' },
  { q: 'Do I need to know how to code?', a: 'Nope. Setup takes about 60 seconds. Pick a template, connect your tools, and your operator starts working. We also offer free setup calls if you want a hand.' },
  { q: 'What happens during the free trial?', a: 'You get full access for 3 days — no credit card required. Deploy operators, connect tools, and see real results before you commit.' },
  { q: 'Can I cancel anytime?', a: 'Yes, zero contracts, zero cancellation fees. You can pause or cancel your subscription at any time from your dashboard.' },
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
              Got Questions? Freemi's Got Answers.
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
                  style={{ background: '#fff', border: '1px solid rgba(108,92,231,0.15)', color: '#6C5CE7', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
                  Ask me! 👋
                </motion.div>
              </motion.div>
            </div>
            <p className="text-gray-500 mt-3 text-lg">Everything you need to know before deploying your first operator.</p>
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
                <AccordionTrigger className="text-surface font-semibold text-left hover:no-underline hover:text-[#6C5CE7] transition-colors py-5 text-sm">
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