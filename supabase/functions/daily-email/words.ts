// Curated vocabulary list for the daily email's "Words of the Day" section.
// Deliberately large, deliberately advanced/rare, and spread across domains
// so daily picks (1 featured + 4 bonus) don't visibly repeat for months.
// Add more entries any time — the picker just indexes by day-of-year, so
// growing the list only helps.

export interface WordEntry {
  word: string;
  definition: string;
  example: string;
  category: string;
}

export const WORDS: WordEntry[] = [
  // General — advanced/literary vocabulary, not common SAT-list filler
  { word: "perspicacious", definition: "having a keen, penetrating insight; mentally sharp", example: "Her perspicacious reading of the contract caught a clause everyone else missed.", category: "general" },
  { word: "obstreperous", definition: "noisy and difficult to control", example: "The obstreperous crowd drowned out the referee's whistle.", category: "general" },
  { word: "perfunctory", definition: "carried out with minimal effort, as a mere formality", example: "He gave a perfunctory nod and went back to his phone.", category: "general" },
  { word: "ineffable", definition: "too great or extreme to be expressed in words", example: "Standing at the canyon's rim, she felt an ineffable sense of scale.", category: "general" },
  { word: "sui generis", definition: "unique; in a class of its own", example: "Critics called the album sui generis, unlike anything in the genre.", category: "general" },
  { word: "pellucid", definition: "transparently clear in style, meaning, or water", example: "The lake was so pellucid you could count the stones on the bottom.", category: "general" },
  { word: "lugubrious", definition: "looking or sounding sad and dismal, often exaggeratedly so", example: "The funeral march's lugubrious tone filled the hall.", category: "general" },
  { word: "mercurial", definition: "subject to sudden, unpredictable changes of mood", example: "The chef's mercurial temper kept the whole kitchen on edge.", category: "general" },
  { word: "obdurate", definition: "stubbornly refusing to change one's opinion or course of action", example: "He remained obdurate despite hours of persuasion.", category: "general" },
  { word: "recalcitrant", definition: "having an obstinately uncooperative attitude toward authority", example: "The recalcitrant witness refused to answer any questions.", category: "general" },
  { word: "sanguine", definition: "optimistic or positive, especially in a difficult situation", example: "She stayed sanguine about the startup's odds even after the second rejection.", category: "general" },
  { word: "taciturn", definition: "reserved or uncommunicative in speech; saying little", example: "The taciturn farmer answered every question in a single word.", category: "general" },
  { word: "vitriolic", definition: "filled with bitter criticism or malice", example: "The op-ed was a vitriolic takedown of the new policy.", category: "general" },
  { word: "apposite", definition: "apt or highly relevant in the circumstances", example: "She found an apposite quote from the report to open her speech.", category: "general" },
  { word: "desultory", definition: "lacking a plan, purpose, or enthusiasm; disconnected", example: "They kept up a desultory conversation while waiting for the delayed train.", category: "general" },
  { word: "inveterate", definition: "having a long-established habit; deeply rooted and unlikely to change", example: "He's an inveterate collector of first-edition novels.", category: "general" },
  { word: "laconic", definition: "using very few words; terse", example: "His laconic reply — \"noted\" — ended the debate.", category: "general" },
  { word: "opprobrium", definition: "harsh criticism or public disgrace arising from shameful conduct", example: "The scandal brought widespread opprobrium on the firm.", category: "general" },
  { word: "peripatetic", definition: "traveling from place to place, especially for work", example: "Her peripatetic childhood meant six schools in eight years.", category: "general" },
  { word: "pusillanimous", definition: "lacking courage or resolution; cowardly", example: "The board's pusillanimous response satisfied no one.", category: "general" },
  { word: "querulous", definition: "complaining in a petulant or whining manner", example: "The querulous passenger flagged down three different flight attendants.", category: "general" },
  { word: "rarefied", definition: "distinct from ordinary people or things; highly exclusive", example: "He moved easily through the rarefied circles of old money.", category: "general" },
  { word: "salubrious", definition: "health-giving; beneficial to well-being", example: "The mountain air was salubrious after months in the city.", category: "general" },
  { word: "solipsistic", definition: "concerned only with one's own experience or existence", example: "The memoir's solipsistic focus left little room for other characters.", category: "general" },
  { word: "torpid", definition: "mentally or physically inactive; sluggish, lethargic", example: "The heat left the whole office torpid by mid-afternoon.", category: "general" },
  { word: "truculent", definition: "eager to argue or fight; aggressively defiant", example: "The truculent teenager slammed the door on every suggestion.", category: "general" },
  { word: "effete", definition: "affected, overrefined, and lacking vigor or practicality", example: "Critics dismissed the manifesto as effete academic posturing.", category: "general" },
  { word: "fatuous", definition: "silly and pointless in a self-satisfied way", example: "He waved off the risks with a fatuous grin.", category: "general" },
  { word: "imperious", definition: "assuming power or authority without justification; domineering", example: "Her imperious tone made even the CEO flinch.", category: "general" },
  { word: "surreptitious", definition: "kept secret, especially because it would not be approved of", example: "He took a surreptitious glance at his notes during the exam.", category: "general" },

  // Food — technical culinary craft, not everyday cooking words
  { word: "gastrique", definition: "a reduction of vinegar and caramelized sugar used as a sweet-sour sauce base", example: "The duck was finished with a cherry gastrique.", category: "food" },
  { word: "velouté", definition: "one of the mother sauces: a light stock thickened with a blond roux", example: "The chicken velouté formed the base for the pan sauce.", category: "food" },
  { word: "chiffonade", definition: "a technique of thinly slicing leafy greens or herbs into ribbons", example: "Finish the plate with a basil chiffonade.", category: "food" },
  { word: "maillard reaction", definition: "the chemical browning reaction between amino acids and sugars when meat or bread is seared", example: "A hard sear triggers the Maillard reaction that gives steak its crust.", category: "food" },
  { word: "nappe", definition: "the consistency of a sauce thick enough to coat the back of a spoon", example: "Reduce the cream sauce until it reaches a nappe consistency.", category: "food" },
  { word: "quenelle", definition: "an oval scoop of a soft mixture, or the technique used to shape it", example: "The mousse was plated as a neat quenelle beside the tart.", category: "food" },
  { word: "rendering", definition: "slowly melting fat away from meat over low heat", example: "Rendering the duck skin first keeps it from turning rubbery.", category: "food" },
  { word: "tempering", definition: "gradually raising a cold ingredient's temperature with a hot one to prevent curdling", example: "Temper the eggs with warm milk before adding them to the custard.", category: "food" },
  { word: "amuse-bouche", definition: "a small, complimentary bite served before a meal to preview the chef's style", example: "The tasting menu opened with a single-bite amuse-bouche.", category: "food" },
  { word: "crudo", definition: "raw fish or meat, thinly sliced and dressed, Italian-style", example: "The tuna crudo was dressed with olive oil and citrus.", category: "food" },
  { word: "gremolata", definition: "a chopped condiment of parsley, garlic, and lemon zest, often served with braised meats", example: "A spoonful of gremolata cut through the richness of the osso buco.", category: "food" },
  { word: "beurre blanc", definition: "a warm, emulsified butter sauce made with wine and shallots", example: "The halibut arrived under a delicate beurre blanc.", category: "food" },
  { word: "brunoise", definition: "a very fine dice, usually vegetables cut into 1–3mm cubes", example: "A brunoise of carrot and celery formed the soup's base.", category: "food" },
  { word: "sous vide", definition: "cooking food slowly in a sealed bag in temperature-controlled water", example: "The short rib was cooked sous vide for 48 hours.", category: "food" },
  { word: "confit", definition: "food, typically meat, slow-cooked and preserved in its own fat", example: "Duck confit is rich and falls off the bone.", category: "food" },
  { word: "terroir", definition: "the complete natural environment — soil, climate, terrain — that gives a food or wine its character", example: "The wine's minerality is a signature of the region's terroir.", category: "food" },

  // Finance — technical instruments and market mechanics
  { word: "contango", definition: "a market condition where futures prices are higher than the expected future spot price", example: "The oil market slipped into contango as storage costs rose.", category: "finance" },
  { word: "backwardation", definition: "a market condition where futures prices are lower than the expected future spot price", example: "Backwardation in the futures curve signaled tight near-term supply.", category: "finance" },
  { word: "convexity", definition: "a measure of how a bond's price sensitivity to interest rates changes as rates move", example: "The fund favored bonds with high convexity to cushion against rate swings.", category: "finance" },
  { word: "duration", definition: "a measure of a bond's price sensitivity to a change in interest rates", example: "Longer-duration bonds fell harder when the Fed raised rates.", category: "finance" },
  { word: "basis point", definition: "one hundredth of a percentage point, used to describe interest rate changes", example: "The central bank raised rates by twenty-five basis points.", category: "finance" },
  { word: "carry trade", definition: "borrowing in a low-interest currency to invest in a higher-yielding one", example: "The yen carry trade unwound sharply when volatility spiked.", category: "finance" },
  { word: "mezzanine financing", definition: "a hybrid of debt and equity financing, subordinate to senior debt but senior to equity", example: "The buyout was partly funded with mezzanine financing.", category: "finance" },
  { word: "tranche", definition: "a portion of a larger pool of securities, divided by risk, maturity, or return", example: "The senior tranche was rated AAA despite the underlying risk.", category: "finance" },
  { word: "gamma", definition: "the rate of change of an option's delta relative to the underlying asset's price", example: "Traders watched gamma exposure closely near the options expiry.", category: "finance" },
  { word: "vega", definition: "a measure of an option's price sensitivity to changes in volatility", example: "High vega made the position highly sensitive to the earnings surprise.", category: "finance" },
  { word: "counterparty risk", definition: "the risk that the other party in a financial transaction may default on its obligations", example: "The bank hedged its counterparty risk with collateral requirements.", category: "finance" },
  { word: "moral hazard", definition: "a situation where one party takes on more risk because another party bears the cost", example: "Bailouts raise concerns about moral hazard in the banking sector.", category: "finance" },
  { word: "securitization", definition: "pooling financial assets like loans and selling them as tradable securities", example: "Securitization of the mortgages spread the risk across many investors.", category: "finance" },
  { word: "covenant", definition: "a condition in a loan agreement restricting the borrower's actions", example: "The loan's covenant capped how much additional debt the company could take on.", category: "finance" },
  { word: "accretion", definition: "the gradual increase in a discount bond's value as it nears maturity", example: "The bond's accretion added steadily to the fund's reported returns.", category: "finance" },
  { word: "arbitrage", definition: "profiting from a price difference of the same asset across different markets", example: "The trader ran a quick arbitrage between two exchanges before the gap closed.", category: "finance" },

  // Healthcare — clinical and pharmacological terminology
  { word: "iatrogenic", definition: "relating to illness or complications caused by medical treatment itself", example: "The infection was iatrogenic, traced to the surgical site.", category: "healthcare" },
  { word: "nosocomial", definition: "originating or acquired in a hospital setting", example: "The unit tightened protocols after a spike in nosocomial infections.", category: "healthcare" },
  { word: "sequela", definition: "a condition that results from a previous disease or injury", example: "Chronic fatigue was a lingering sequela of the infection.", category: "healthcare" },
  { word: "oncogenesis", definition: "the process by which normal cells transform into cancerous ones", example: "The lab studies how specific mutations drive oncogenesis.", category: "healthcare" },
  { word: "pharmacokinetics", definition: "the study of how a drug moves through the body — absorption, distribution, metabolism, excretion", example: "The trial's first phase focused on the drug's pharmacokinetics.", category: "healthcare" },
  { word: "pharmacodynamics", definition: "the study of a drug's biochemical and physiological effects on the body", example: "Pharmacodynamics helped explain why the dose caused such a strong response.", category: "healthcare" },
  { word: "teratogenic", definition: "capable of causing malformations in a developing embryo or fetus", example: "The drug's teratogenic risk means it's avoided during pregnancy.", category: "healthcare" },
  { word: "polypharmacy", definition: "the concurrent use of multiple medications by a single patient", example: "Polypharmacy in elderly patients raises the risk of dangerous drug interactions.", category: "healthcare" },
  { word: "refractory", definition: "resistant to treatment; not responding as expected", example: "Her seizures were refractory to the first three medications tried.", category: "healthcare" },
  { word: "exacerbation", definition: "a worsening of a disease or its symptoms", example: "Cold weather often triggers an exacerbation of his asthma.", category: "healthcare" },
  { word: "prodrome", definition: "early symptoms indicating the onset of a disease before its full presentation", example: "A visual aura is a common prodrome before a migraine.", category: "healthcare" },
  { word: "subclinical", definition: "describing a disease present in the body but not yet producing noticeable symptoms", example: "The screening caught a subclinical thyroid condition.", category: "healthcare" },
  { word: "ischemia", definition: "an inadequate blood supply to an organ or tissue", example: "Cardiac ischemia was visible on the stress test.", category: "healthcare" },
  { word: "dysphagia", definition: "difficulty or discomfort in swallowing", example: "The stroke left him with mild dysphagia during recovery.", category: "healthcare" },

  // Sports — training, tactics, and analytics jargon
  { word: "zonal marking", definition: "a defensive tactic where players guard areas of the field rather than specific opponents", example: "The team switched to zonal marking on corner kicks after the injury.", category: "sports" },
  { word: "Pythagorean expectation", definition: "a formula estimating a team's expected win percentage from points scored versus allowed", example: "Their Pythagorean expectation suggested the team was better than its record showed.", category: "sports" },
  { word: "regression to the mean", definition: "the statistical tendency for unusually extreme performances to normalize over time", example: "Analysts expected regression to the mean after his historic shooting streak.", category: "sports" },
  { word: "fartlek", definition: "a training method mixing fast and slow running intervals within one continuous session", example: "The coach added a weekly fartlek run to build race-pace tolerance.", category: "sports" },
  { word: "periodization", definition: "structuring training into cycles to time peak performance for competition", example: "Her periodization plan built to peak fitness right before the trials.", category: "sports" },
  { word: "plyometric", definition: "exercises using rapid stretching and contracting of muscles to build explosive power", example: "Box jumps are a classic plyometric exercise for sprinters.", category: "sports" },
  { word: "proprioception", definition: "the body's sense of its own position, movement, and balance", example: "Balance drills on an unstable surface help rebuild proprioception after an ankle injury.", category: "sports" },
  { word: "lactate threshold", definition: "the exercise intensity at which lactate builds up in the blood faster than it can be cleared", example: "Raising his lactate threshold let him hold a faster pace longer.", category: "sports" },
  { word: "apex", definition: "the innermost point of a curve, marking the ideal cornering line in racing", example: "She braked late and clipped the apex perfectly through turn three.", category: "sports" },
  { word: "drafting", definition: "positioning closely behind another competitor to reduce air or water resistance", example: "Drafting behind the lead cyclist saved him significant energy.", category: "sports" },
  { word: "taper", definition: "a planned reduction in training volume before competition to maximize performance", example: "The two-week taper left her legs fresh for race day.", category: "sports" },
  { word: "VO2 max", definition: "the maximum rate of oxygen the body can use during intense exercise, a key fitness marker", example: "Elite endurance athletes often have a VO2 max above 70.", category: "sports" },

  // Science — physics, chemistry, and systems concepts
  { word: "entropy", definition: "a measure of disorder or randomness in a system", example: "Without upkeep, entropy in the old codebase kept increasing.", category: "science" },
  { word: "heuristic", definition: "a practical shortcut method for solving a problem quickly, without guaranteeing optimality", example: "The chess engine uses a heuristic to evaluate positions fast.", category: "science" },
  { word: "asymptote", definition: "a line that a curve approaches but never quite touches", example: "The growth curve flattens toward an asymptote at scale.", category: "science" },
  { word: "biomimicry", definition: "designing systems or materials modeled on biological processes found in nature", example: "The building's cooling system uses biomimicry inspired by termite mounds.", category: "science" },
  { word: "singularity", definition: "a hypothetical point where technological growth becomes uncontrollable and irreversible", example: "Researchers debate how close we actually are to a technological singularity.", category: "science" },
  { word: "throughput", definition: "the amount of material or data passing through a system in a given time", example: "The upgrade doubled the factory line's throughput.", category: "science" },
  { word: "interoperability", definition: "the ability of different systems to work together and exchange information", example: "Poor interoperability between the two platforms slowed the migration.", category: "science" },
  { word: "latency", definition: "the delay between an input and the resulting response in a system", example: "The satellite link added noticeable latency to the call.", category: "science" },
  { word: "stochastic", definition: "involving randomness, used to describe systems governed by probability rather than certainty", example: "The model treats demand as a stochastic process rather than a fixed number.", category: "science" },
  { word: "allostasis", definition: "the process of achieving physiological stability through active adaptation to change", example: "Chronic stress overloads the body's allostasis, wearing down its systems over time.", category: "science" },
  { word: "epigenetics", definition: "the study of heritable changes in gene expression that don't alter the DNA sequence itself", example: "Epigenetics helps explain how identical twins can develop differently over time.", category: "science" },
  { word: "superconductivity", definition: "the property of certain materials to conduct electricity with zero resistance below a critical temperature", example: "MRI magnets rely on superconductivity to generate their powerful fields.", category: "science" },
  { word: "redundancy", definition: "the inclusion of extra components so a system keeps working if one part fails", example: "The spacecraft had triple redundancy on its critical systems.", category: "science" },
  { word: "obsolescence", definition: "the process by which something becomes outdated or falls out of use", example: "Planned obsolescence keeps consumers replacing devices sooner than necessary.", category: "science" },

  // Arts & literature
  { word: "verisimilitude", definition: "the appearance of being true or real within a work of fiction", example: "The director insisted on verisimilitude, filming on real city streets.", category: "arts" },
  { word: "pathos", definition: "a quality in a work of art that evokes pity or sadness", example: "The final scene leans heavily on pathos to land its ending.", category: "arts" },
  { word: "denouement", definition: "the final resolution of the strands of a story's plot", example: "The novel's denouement ties up every subplot neatly.", category: "arts" },
  { word: "leitmotif", definition: "a recurring musical or thematic phrase associated with a person, idea, or situation", example: "The villain's leitmotif plays every time he appears on screen.", category: "arts" },
  { word: "pastiche", definition: "a work that imitates the style of another artist, genre, or period", example: "The album is a loving pastiche of 1970s soul music.", category: "arts" },
  { word: "chiaroscuro", definition: "the use of strong contrasts between light and dark in a work of art", example: "Caravaggio was famous for his dramatic use of chiaroscuro.", category: "arts" },
  { word: "vernacular", definition: "the everyday language or dialect spoken by ordinary people in a region", example: "The playwright wrote dialogue in the local vernacular.", category: "arts" },
  { word: "mise-en-scène", definition: "the arrangement of everything visible within a film or theater frame — set, lighting, actors", example: "The director's meticulous mise-en-scène gave every frame a painterly quality.", category: "arts" },
  { word: "bildungsroman", definition: "a novel dealing with a character's formative years and moral development", example: "The book is a classic bildungsroman about a girl coming of age in wartime.", category: "arts" },
  { word: "ekphrasis", definition: "a vivid written description of a visual work of art", example: "The poem is an ekphrasis inspired by a Vermeer painting.", category: "arts" },
  { word: "polyphony", definition: "music with two or more independent melodic lines sounding simultaneously", example: "Bach's fugues are masterclasses in polyphony.", category: "arts" },
  { word: "in medias res", definition: "a narrative technique of starting a story in the middle of the action", example: "The film opens in medias res, mid-chase, with no context given.", category: "arts" },
  { word: "trompe-l'œil", definition: "a visual illusion technique creating the impression of three-dimensional realism on a flat surface", example: "The ceiling's trompe-l'œil made the dome look far higher than it was.", category: "arts" },

  // Law & government
  { word: "estoppel", definition: "a legal principle preventing someone from arguing something contrary to a claim they previously made", example: "The court applied estoppel since the company had earlier admitted the debt.", category: "law" },
  { word: "certiorari", definition: "a writ by which a higher court reviews the decision of a lower court", example: "The Supreme Court granted certiorari to hear the appeal.", category: "law" },
  { word: "res judicata", definition: "a matter that has been finally decided by a court and cannot be pursued again", example: "The second lawsuit was dismissed under res judicata.", category: "law" },
  { word: "mens rea", definition: "the intention or knowledge of wrongdoing required to establish criminal liability", example: "Prosecutors had to prove mens rea, not just that the act occurred.", category: "law" },
  { word: "amicus curiae", definition: "a \"friend of the court\" brief filed by a non-party offering relevant information", example: "Several advocacy groups filed amicus curiae briefs in the case.", category: "law" },
  { word: "subpoena duces tecum", definition: "a court order requiring someone to produce documents or evidence", example: "The firm was served a subpoena duces tecum for its financial records.", category: "law" },
  { word: "voir dire", definition: "the process of questioning prospective jurors to determine their suitability to serve", example: "Voir dire took three full days before the jury was seated.", category: "law" },
  { word: "ultra vires", definition: "an act performed beyond the legal power or authority of a person or entity", example: "The court struck down the regulation as ultra vires.", category: "law" },
  { word: "sovereignty", definition: "the supreme authority of a state to govern itself without outside interference", example: "The treaty was carefully worded to respect each nation's sovereignty.", category: "law" },
  { word: "clemency", definition: "mercy shown by reducing or excusing a legal punishment", example: "The governor granted clemency to the aging inmate.", category: "law" },
  { word: "recusal", definition: "the act of a judge or official withdrawing from a case due to a conflict of interest", example: "The judge's recusal delayed the trial by two weeks.", category: "law" },
  { word: "bona fide", definition: "made or done in good faith, without fraud or deceit", example: "The court found it was a bona fide business transaction.", category: "law" },

  // Psychology & behavior
  { word: "cognitive dissonance", definition: "mental discomfort experienced from holding two conflicting beliefs at once", example: "He felt cognitive dissonance buying the car right after criticizing consumerism.", category: "psychology" },
  { word: "confirmation bias", definition: "the tendency to favor information that confirms one's existing beliefs", example: "Confirmation bias led her to only read articles she already agreed with.", category: "psychology" },
  { word: "rumination", definition: "repeated, often negative dwelling on the same thought or problem", example: "Rumination over the mistake kept him up half the night.", category: "psychology" },
  { word: "extrinsic motivation", definition: "motivation driven by external rewards rather than internal satisfaction", example: "The year-end bonus was pure extrinsic motivation to hit the deadline.", category: "psychology" },
  { word: "anchoring bias", definition: "the tendency to rely too heavily on the first piece of information encountered", example: "The inflated list price created an anchoring bias for every offer after it.", category: "psychology" },
  { word: "affect heuristic", definition: "making judgments based on emotional reaction rather than a careful weighing of evidence", example: "The affect heuristic made the flashy pitch feel safer than the numbers actually supported.", category: "psychology" },
  { word: "projection", definition: "unconsciously attributing one's own feelings or traits to someone else", example: "His accusations said more about projection than about her actual behavior.", category: "psychology" },
  { word: "learned helplessness", definition: "a state in which repeated setbacks lead someone to stop trying to change their situation", example: "Years of rejection left him with a kind of learned helplessness about job hunting.", category: "psychology" },
  { word: "catharsis", definition: "the process of releasing strong or repressed emotions", example: "Writing the letter, even unsent, gave her a sense of catharsis.", category: "psychology" },
  { word: "groupthink", definition: "the tendency for a cohesive group to make poor decisions to avoid conflict or dissent", example: "Groupthink led the committee to approve a plan nobody had actually scrutinized.", category: "psychology" },
  { word: "self-efficacy", definition: "one's belief in their own capacity to execute the behaviors needed to succeed", example: "Small early wins steadily built the team's self-efficacy.", category: "psychology" },
  { word: "dunning-kruger effect", definition: "a cognitive bias where people with limited ability overestimate their own competence", example: "His confident, wrong answers were a textbook case of the Dunning-Kruger effect.", category: "psychology" },
  { word: "sunk cost fallacy", definition: "continuing a behavior because of previously invested resources rather than future value", example: "They kept funding the failing project out of the sunk cost fallacy.", category: "psychology" },

  // Nature & environment
  { word: "biogeochemical cycle", definition: "the pathway by which a chemical element moves through the biological and physical parts of Earth", example: "The nitrogen biogeochemical cycle links soil bacteria, plants, and the atmosphere.", category: "nature" },
  { word: "eutrophication", definition: "excessive nutrient enrichment of water causing dense plant growth and oxygen depletion", example: "Fertilizer runoff triggered eutrophication in the lake, killing off the fish.", category: "nature" },
  { word: "keystone species", definition: "a species with a disproportionately large effect on its ecosystem relative to its abundance", example: "Sea otters are a keystone species that keep urchin populations in check.", category: "nature" },
  { word: "trophic cascade", definition: "a chain reaction of ecological effects triggered by adding or removing a top predator", example: "Reintroducing wolves set off a trophic cascade that reshaped the entire valley.", category: "nature" },
  { word: "phenology", definition: "the study of cyclic, seasonal natural phenomena like migration and flowering", example: "Phenology records show flowers blooming two weeks earlier than a century ago.", category: "nature" },
  { word: "bioaccumulation", definition: "the gradual buildup of substances, like toxins, in an organism over time", example: "Mercury bioaccumulation makes large predatory fish riskier to eat often.", category: "nature" },
  { word: "endemism", definition: "the state of a species being native and restricted to a single geographic region", example: "The island's high endemism means many species exist nowhere else on Earth.", category: "nature" },
  { word: "carrying capacity", definition: "the maximum population size an environment can sustain given its resources", example: "The herd exceeded the range's carrying capacity after two mild winters.", category: "nature" },

  // Data science
  { word: "heteroscedasticity", definition: "when the variance of errors in a regression model is not constant across observations", example: "The residual plot revealed heteroscedasticity, undermining the model's assumptions.", category: "data-science" },
  { word: "multicollinearity", definition: "when two or more predictor variables in a regression are highly correlated with each other", example: "Multicollinearity between the two features made their individual effects hard to isolate.", category: "data-science" },
  { word: "p-hacking", definition: "manipulating data analysis, often by testing many variables, until a nonsignificant result becomes significant", example: "The retracted study turned out to be a case of p-hacking across dozens of subgroups.", category: "data-science" },

  // Computer science
  { word: "idempotent", definition: "describing an operation that produces the same result no matter how many times it's applied", example: "The API endpoint was made idempotent so retries wouldn't create duplicate charges.", category: "computer-science" },
  { word: "memoization", definition: "an optimization technique that caches the results of expensive function calls for reuse", example: "Memoization cut the recursive function's runtime from minutes to milliseconds.", category: "computer-science" },
  { word: "Byzantine fault tolerance", definition: "a system's ability to keep functioning correctly even if some components fail or act maliciously", example: "Blockchain consensus protocols are designed around Byzantine fault tolerance.", category: "computer-science" },

  // Pharmaceuticals — brand name (generic/chemical name) and what it treats
  { word: "Ozempic (semaglutide)", definition: "a GLP-1 receptor agonist used to treat type 2 diabetes and, at higher doses, chronic weight management", example: "Her doctor prescribed Ozempic to help manage her blood sugar.", category: "pharma" },
  { word: "Lipitor (atorvastatin)", definition: "a statin used to lower LDL cholesterol and reduce the risk of cardiovascular disease", example: "He's been on Lipitor since his cholesterol screening came back high.", category: "pharma" },
  { word: "Xanax (alprazolam)", definition: "a fast-acting benzodiazepine used to treat anxiety disorders and panic disorder", example: "She keeps Xanax on hand for occasional panic attacks before flights.", category: "pharma" },
];
