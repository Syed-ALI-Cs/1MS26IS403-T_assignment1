export interface SampleMaterial {
  id: string;
  title: string;
  category: string;
  suggestedDifficulty: 'easy' | 'medium' | 'hard';
  content: string;
}

export const SAMPLE_MATERIALS: SampleMaterial[] = [
  {
    id: 'bio-respiration',
    title: 'Cellular Respiration & ATP Production',
    category: 'Biology',
    suggestedDifficulty: 'medium',
    content: `Cellular respiration is the biochemical pathway through which eukaryotic cells break down glucose to generate adenosine triphosphate (ATP), the universal chemical energy currency of biological organisms. The overarching process is catabolic and exergonic, described by the balanced equation: C6H12O6 + 6O2 -> 6CO2 + 6H2O + approximately 30 to 32 ATP molecules.

The pathway proceeds in three distinct sequential stages:
1. Glycolysis takes place in the cell cytoplasm under anaerobic conditions. One 6-carbon molecule of glucose is cleaved into two 3-carbon pyruvate molecules, yielding a net production of 2 ATP (via substrate-level phosphorylation) and 2 NADH.
2. The Citric Acid Cycle (Krebs Cycle) occurs inside the mitochondrial matrix following the pyruvate oxidation transition step (which turns pyruvate into acetyl-CoA). Each turn of the cycle processes one acetyl-CoA, producing carbon dioxide waste, 1 ATP (or GTP), 3 NADH, and 1 FADH2 electron carriers.
3. Oxidative Phosphorylation occurs across the inner mitochondrial membrane (cristae). High-energy electrons donated by NADH and FADH2 traverse protein complexes I through IV of the electron transport chain (ETC). As electrons cascade downward along an electronegativity gradient to molecular oxygen (the terminal electron acceptor), protons (H+) are pumped into the intermembrane space. This creates an electrochemical proton-motive force. Protons then flow back down their concentration gradient through the enzyme ATP synthase via chemiosmosis, rotating its rotor stalk to phosphorylate ADP into ATP. If oxygen is absent, the ETC halts, electron carriers cannot be regenerated, and cells must rely on fermentation pathways.`
  },
  {
    id: 'econ-elasticity',
    title: 'Price Elasticity of Demand & Market Equilibrium',
    category: 'Economics',
    suggestedDifficulty: 'easy',
    content: `Price Elasticity of Demand (PED) measures how sensitively consumer quantity demanded responds to changes in the market price of a good or service. Mathematically, PED is expressed as the percentage change in quantity demanded divided by the percentage change in price (%ΔQd / %ΔP).

Because the law of demand dictates an inverse relationship between price and quantity, economists often interpret elasticity using absolute values. 
- When PED is greater than 1 (|PED| > 1), demand is considered price elastic. Consumers are highly responsive to price adjustments. For instance, luxury goods or goods with readily accessible substitutes demonstrate high elasticity. A price hike in elastic goods leads to a sharp decline in sales, diminishing total firm revenue (TR = P × Q).
- When PED is less than 1 (|PED| < 1), demand is price inelastic. Consumers will continue purchasing the product despite increases in price because the commodity is a necessity, has few viable substitutes, or comprises a minor share of their overall budget (such as life-saving insulin or residential tap water). For inelastic commodities, increasing the price causes total revenue to rise because the percentage drop in quantity demanded is smaller than the percentage gain in price.
- When PED equals exactly 1, demand exhibits unit elasticity, meaning total revenue remains constant when price fluctuates.`
  },
  {
    id: 'cs-sorting-hash',
    title: 'Hash Tables, Collision Resolution & Time Complexity',
    category: 'Computer Science',
    suggestedDifficulty: 'hard',
    content: `A Hash Table is an associative data structure that maps keys to values for efficient retrieval. Under optimal conditions, operations including insert, search, and delete achieve an average-case time complexity of O(1). 

The core mechanism relies on a deterministic hash function that transforms an arbitrary key into an integer array index within the bounds of a fixed-size backing array (bucket array). A well-designed hash function satisfies two criteria: uniform distribution (dispersing keys evenly across buckets) and determinism (consistently yielding identical indices for equivalent keys).

Because the universe of possible keys typically dwarfs the array size, collisions are mathematically inevitable according to the Pigeonhole Principle. Two primary collision resolution strategies exist:
1. Separate Chaining: Each index in the bucket array points to an independent linked list or self-balancing binary search tree (such as a red-black tree). Colliding entries are appended to the chain. In the worst-case scenario where all keys hash to the identical bucket, search degrades to O(N).
2. Open Addressing: All elements reside directly within the backing table. When a collision occurs, the algorithm systematically probes subsequent slots until an unoccupied cell is identified. Common probing schemes include linear probing (testing index + 1, + 2, which induces primary clustering), quadratic probing, and double hashing.
The load factor (α = n / m, where n is the number of stored keys and m is the table capacity) governs performance. Once α crosses a threshold (typically 0.75), dynamic resizing (rehashing) must be executed: a new array of double capacity is allocated, and every existing key must be recomputed and inserted, incurring an O(N) amortized maintenance cost.`
  }
];
