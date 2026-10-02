import { m } from '@/paraglide/messages.js';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

/** FAQ keys in display order — also used to build the FAQPage JSON-LD schema. */
export const FAQ_KEYS = [
  'free',
  'login',
  'layout',
  'room_types',
  'styles',
  'phone',
  'time',
  'commercial',
] as const;

/**
 * FAQ — Apple-style minimal accordion.
 */
export function FAQ() {
  return (
    <section id="faq" className="bg-[#f5f5f7] px-4 py-24 sm:py-32">
      <div className="mx-auto max-w-3xl">
        <div className="mb-14 text-center">
          <h2 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            {m['landing.faq.title']()}
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            {m['landing.faq.description']()}
          </p>
        </div>
        <Accordion className="w-full">
          {FAQ_KEYS.map((key) => (
            <AccordionItem key={key} value={key}>
              <AccordionTrigger className="cursor-pointer py-6 text-left text-lg font-medium hover:no-underline">
                {m[
                  `landing.faq.${key}.question` as 'landing.faq.free.question'
                ]()}
              </AccordionTrigger>
              {/* keepMounted: the answer must exist in the served HTML so it
                  matches the FAQPage JSON-LD (crawlers don't click). */}
              <AccordionContent
                keepMounted
                className="text-muted-foreground pb-6 text-base leading-relaxed"
              >
                {m[`landing.faq.${key}.answer` as 'landing.faq.free.answer']()}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
