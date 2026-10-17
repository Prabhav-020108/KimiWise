// ─── KimiWise — AI Drawing Agent Service ──────────────────────────────────────
// Animates a visible AI Drawing Agent on the Whiteboard canvas, generating
// dynamic high-accuracy flowcharts, mindmaps, and detailed blackboard lesson notes
// with live cursor tracking and dual-pane layout.

import { fabric } from 'fabric';
import { useStore } from '../store';
import { aiService, type BoardLessonData } from './aiService';

const FabricClass = (fabric as any)?.fabric || fabric || (window as any).fabric;

export interface DiagramNode {
  label: string;
  sublabel?: string;
  type: 'start' | 'process' | 'decision' | 'end';
  color?: string;
}

export interface LessonNotes {
  title: string;
  overview: string;
  keyPrinciples: string[];
  realWorldAnalogy: string;
  takeaway: string;
}

export interface DiagramData {
  title: string;
  type: 'flowchart' | 'mindmap' | 'svg';
  svg?: string;
  nodes: DiagramNode[];
  lessonNotes?: LessonNotes;
}

// ── Text Wrapping Helper for Fabric.js Multiline Text ─────────────────────────
function wrapText(str: string, maxCharsPerLine: number = 46): string {
  if (!str) return '';
  const words = str.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine) {
      currentLine = (currentLine + ' ' + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines.join('\n');
}

// ── Offline Educational Knowledge Catalog (30+ Domains Fallback) ──────────────
export function parseEducationalPrompt(prompt: string): DiagramData {
  const p = prompt.toLowerCase();

  // 1. AI, Machine Learning, Deep Learning, Neural Networks
  if (
    p.includes('aiml') ||
    p.includes('machine learning') ||
    p.includes('deep learning') ||
    p.includes('neural network') ||
    p.includes('transformer') ||
    (p.includes('roadmap') && (p.includes('ai') || p.includes('tech')))
  ) {
    let items: string[] = [];
    const withMatch = prompt.match(/with\s+(.+)$/i);
    if (withMatch && withMatch[1]) {
      items = withMatch[1]
        .split(/,|\band\b/i)
        .map((s) => s.replace(/\.$/, '').trim())
        .filter((s) => s.length > 1);
    }

    const nodes: DiagramNode[] =
      items.length >= 3
        ? items.map((item, idx) => ({
            label: item,
            sublabel:
              idx === 0
                ? 'Foundations & Mathematical Tooling'
                : idx === items.length - 1
                ? 'Production Deployment & MLOps'
                : `Phase ${idx + 1}: Core Theoretical Competency`,
            type:
              idx === 0
                ? 'start'
                : idx === items.length - 1
                ? 'end'
                : idx === Math.floor(items.length / 2)
                ? 'decision'
                : 'process',
          }))
        : [
            { label: 'Foundations & Math', sublabel: 'Python, Linear Algebra & Multivariable Calculus', type: 'start' },
            { label: 'Statistical Machine Learning', sublabel: 'Regression, Decision Trees, SVM & Scikit-Learn', type: 'process' },
            { label: 'Deep Learning & PyTorch', sublabel: 'Backpropagation, Optimizers (Adam) & Loss Functions', type: 'process' },
            { label: 'Transformers & LLM Architectures', sublabel: 'Self-Attention, Pre-training & Gemma 4 Tuning', type: 'decision' },
            { label: 'Production MLOps & Deployment', sublabel: 'Docker, Triton Server, Quantization & Latency Budgets', type: 'end' },
          ];

    return {
      title: 'AI & Machine Learning Engineering Roadmap',
      type: 'flowchart',
      nodes,
      lessonNotes: {
        title: 'Machine Learning & Neural Foundations',
        overview:
          'Modern AI progresses from mathematical representation (vectors and loss landscapes) to parametric function approximation. Deep architectures learn hierarchical feature representations through gradient descent.',
        keyPrinciples: [
          'Feature Representations: High-dimensional embeddings preserve semantic and geometric relationships.',
          'Empirical Risk Minimization: Loss minimization via backpropagation calculates analytical gradients.',
          'Generalization vs Overfitting: Regularization, dropout, and validation curves maintain out-of-sample accuracy.',
        ],
        realWorldAnalogy:
          'Imagine tuning a radio receiver with billions of tiny dials: gradient descent tells you which direction to turn each dial so static turns into crystal clear audio.',
        takeaway:
          'Mastery comes from grasping linear algebra and tensor transformations before touching high-level libraries.',
      },
    };
  }

  // 2. Binary Search & Divide-and-Conquer
  if (p.includes('binary search') || (p.includes('search') && p.includes('algorithm'))) {
    return {
      title: 'Binary Search Algorithm (O(log N))',
      type: 'flowchart',
      nodes: [
        { label: 'Initialize Pointers', sublabel: 'Set low = 0, high = arr.length - 1 on sorted array', type: 'start' },
        { label: 'Calculate Pivot Mid', sublabel: 'mid = low + Math.floor((high - low) / 2) (avoids overflow)', type: 'process' },
        { label: 'Evaluate arr[mid] vs Target', sublabel: 'Check equality or determine search direction', type: 'decision' },
        { label: 'Adjust Search Window', sublabel: 'If target < arr[mid] high = mid - 1; else low = mid + 1', type: 'process' },
        { label: 'Return Index or -1', sublabel: 'Target index found or boundary crossed (low > high)', type: 'end' },
      ],
      lessonNotes: {
        title: 'Divide-and-Conquer Search Theory',
        overview:
          'Binary search operates exclusively on monotonically sorted datasets. By halving the search space on every comparison, it reduces linear search O(N) to logarithmic O(log N) efficiency.',
        keyPrinciples: [
          'Precondition: The collection must be sorted prior to execution.',
          'Logarithmic Scaling: A list of 1,000,000 items is searched in at most 20 iterations.',
          'Boundary Correctness: Prevent integer overflow using mid = low + (high - low) / 2.',
        ],
        realWorldAnalogy:
          'Opening a physical telephone directory right in the exact middle, checking if your letter is before or after, and tearing the wrong half away repeatedly.',
        takeaway:
          'Whenever a problem asks for an O(log N) solution, always evaluate binary search or monotonic binary partition.',
      },
    };
  }

  // 3. Web Architecture & Client-Server
  if (p.includes('web') || p.includes('architecture') || p.includes('client server') || p.includes('full stack')) {
    return {
      title: 'Modern Web Application Architecture',
      type: 'flowchart',
      nodes: [
        { label: 'Client: React SPA / Mobile App', sublabel: 'User interaction, state management & DOM hydration', type: 'start' },
        { label: 'Edge Layer: CDN & SSL Termination', sublabel: 'Cloudflare / Fastly reverse proxy with asset caching', type: 'process' },
        { label: 'API Gateway & Auth Verification', sublabel: 'JWT validation, rate limiting & request routing', type: 'decision' },
        { label: 'Microservices & Business Logic', sublabel: 'Node.js Express / Python FastAPI services & AI pipelines', type: 'process' },
        { label: 'Data Tier: PostgreSQL & Redis', sublabel: 'ACID transactions, relational schema & in-memory caching', type: 'end' },
      ],
      lessonNotes: {
        title: 'Distributed Web Architecture',
        overview:
          'Modern web infrastructure decouples presentation, edge delivery, orchestration, and persistence into horizontally scalable tiers designed for fault tolerance and sub-100ms latency.',
        keyPrinciples: [
          'Separation of Concerns: The presentation layer never connects directly to underlying database storage.',
          'Stateless Application Services: Session state is delegated to Redis or signed JWTs, enabling auto-scaling.',
          'Layered Defense: Authentication, rate limiting, and input sanitization occur before business logic runs.',
        ],
        realWorldAnalogy:
          'A fine-dining restaurant: the customer (client) gives orders to the waiter (gateway), who coordinates with the kitchen line (microservices) and pantry (database).',
        takeaway:
          'Design stateless service tiers with clear API contracts so any component can be updated without cascading downtime.',
      },
    };
  }

  // 4. Photosynthesis & Cellular Energy
  if (p.includes('photo') || p.includes('plant') || p.includes('chloroplast') || p.includes('biology')) {
    return {
      title: 'Photosynthesis & Carbon Fixation',
      type: 'flowchart',
      nodes: [
        { label: 'Photon & H2O Absorption', sublabel: 'Light strikes Chlorophyll in thylakoid membranes', type: 'start' },
        { label: 'Light-Dependent Reactions', sublabel: 'Photolysis splits H2O, generating ATP, NADPH & releasing O2', type: 'process' },
        { label: 'RuBisCO CO2 Fixation', sublabel: 'Carbon dioxide binds to ribulose 1,5-bisphosphate', type: 'decision' },
        { label: 'Calvin-Benson Cycle', sublabel: 'ATP & NADPH reduce 3-PGA into G3P triose phosphate sugars', type: 'process' },
        { label: 'Glucose & Biomass Synthesis', sublabel: 'Hexose sugars stored as starch for cellular respiration', type: 'end' },
      ],
      lessonNotes: {
        title: 'Biochemical Energy Transduction',
        overview:
          'Photosynthesis converts radiant solar photons into stable chemical bonds. Water molecules are oxidized to release oxygen, while atmospheric carbon dioxide is reduced into organic glucose.',
        keyPrinciples: [
          'Overall Formula: 6CO2 + 6H2O + Light Energy → C6H12O6 + 6O2.',
          'Light Phase (Thylakoids): Produces the electrochemical gradient and high-energy coenzymes.',
          'Dark Phase (Stroma): Employs RuBisCO to drive enzymatic carbon assimilation without direct sunlight.',
        ],
        realWorldAnalogy:
          'Solar panels charging a battery pack (ATP/NADPH) during daylight, which later powers a 3D sugar printer overnight in the factory.',
        takeaway:
          'All biological food chains ultimately derive their chemical potential energy from the photolysis of water in chloroplasts.',
      },
    };
  }

  // 5. TCP 3-Way Handshake & Networking
  if (p.includes('tcp') || p.includes('handshake') || p.includes('network') || p.includes('protocol') || p.includes('osi')) {
    return {
      title: 'TCP 3-Way Handshake (Connection Establishment)',
      type: 'flowchart',
      nodes: [
        { label: 'Client: SYN Packet Sent', sublabel: 'Client picks Initial Sequence Number (ISN_c), state = SYN_SENT', type: 'start' },
        { label: 'Server: Receives SYN', sublabel: 'Allocates transmission control block buffers, state = SYN_RCVD', type: 'process' },
        { label: 'Server: SYN-ACK Sent', sublabel: 'Acknowledges ISN_c + 1, transmits its own ISN_s', type: 'decision' },
        { label: 'Client: ACK Sent', sublabel: 'Acknowledges ISN_s + 1, connection state = ESTABLISHED', type: 'process' },
        { label: 'Full-Duplex Data Streaming', sublabel: 'Reliable, ordered byte stream transmission begins', type: 'end' },
      ],
      lessonNotes: {
        title: 'Reliable Transport Layer Handshake',
        overview:
          'The TCP 3-Way Handshake establishes a synchronized, reliable connection across an unreliable network by guaranteeing both endpoints agree on sequence numbering and buffer windows.',
        keyPrinciples: [
          'Synchronization (SYN): Both parties independently generate randomized initial sequence numbers.',
          'Cumulative Acknowledgment (ACK): Each confirmation increments the expected incoming byte offset.',
          'SYN Flood Mitigation: Modern kernels utilize SYN Cookies to prevent denial-of-service memory exhaustion.',
        ],
        realWorldAnalogy:
          'Two people on walkie-talkies: "Can you hear me?" (SYN) → "Yes, I hear you! Can you hear me?" (SYN-ACK) → "Yes, loud and clear!" (ACK).',
        takeaway:
          'No payload data flows until both sides have validated mutual synchronization and window buffer allocation.',
      },
    };
  }

  // 6. Operating Systems & Process Scheduling / Deadlock
  if (p.includes('operating system') || p.includes('os') || p.includes('deadlock') || p.includes('process') || p.includes('scheduling')) {
    return {
      title: 'OS Process Lifecycle & Scheduling',
      type: 'flowchart',
      nodes: [
        { label: 'New: Process Ingestion', sublabel: 'Executable loaded into RAM, PCB initialized with PID', type: 'start' },
        { label: 'Ready: Placed in Run Queue', sublabel: 'Waiting for CPU time slice allocation by scheduler', type: 'process' },
        { label: 'Running: CPU Execution', sublabel: 'Instruction pointer registers execute on core; quantum timer active', type: 'decision' },
        { label: 'Waiting / Blocked: I/O Event', sublabel: 'Yields CPU awaiting disk read, network socket or mutex lock', type: 'process' },
        { label: 'Terminated: Exit & Deallocation', sublabel: 'Return code sent to parent, resources freed, zombie reaped', type: 'end' },
      ],
      lessonNotes: {
        title: 'Kernel Process Management & Scheduling',
        overview:
          'An operating system multiplexes hardware execution cores across competing processes using preemptive multitasking and Process Control Blocks (PCBs) to preserve thread state.',
        keyPrinciples: [
          'Context Switching: Saving and restoring CPU registers introduces cache invalidation overhead.',
          'Coffman Deadlock Conditions: Mutual exclusion, hold-and-wait, no-preemption, and circular wait.',
          'Scheduler Policies: Round Robin prioritizes responsiveness; Completely Fair Scheduler (CFS) balances latency.',
        ],
        realWorldAnalogy:
          'A chess grandmaster playing 20 opponents simultaneously: spending a few seconds at each table, memorizing board state, before rotating.',
        takeaway:
          'CPU time is sliced in millisecond quantums to create the seamless illusion of parallel execution.',
      },
    };
  }

  // 7. Database Transactions & ACID
  if (p.includes('database') || p.includes('sql') || p.includes('acid') || p.includes('transaction')) {
    return {
      title: 'Database ACID Transaction Lifecycle',
      type: 'flowchart',
      nodes: [
        { label: 'BEGIN TRANSACTION', sublabel: 'Start transaction scope, allocate snapshot isolation timestamp', type: 'start' },
        { label: 'Write-Ahead Log (WAL) Append', sublabel: 'Modifications written sequentially to disk before buffer pages', type: 'process' },
        { label: 'Constraint & Foreign Key Check', sublabel: 'Validate schema rules, unique indices & trigger constraints', type: 'decision' },
        { label: 'COMMIT & Flush to Storage', sublabel: 'Two-phase commit flushes log to guarantee durability', type: 'process' },
        { label: 'Transaction Complete / Rollback', sublabel: 'Locks released; data visible to concurrent transactions', type: 'end' },
      ],
      lessonNotes: {
        title: 'ACID Guarantees in Relational Databases',
        overview:
          'Relational database engines ensure data integrity across hardware crashes and concurrent queries through the four ACID pillars: Atomicity, Consistency, Isolation, and Durability.',
        keyPrinciples: [
          'Atomicity: All operations succeed together or the entire transaction is rolled back.',
          'Write-Ahead Logging: Modifications are recorded in non-volatile logs before database tables are touched.',
          'Isolation Levels: Read Committed, Repeatable Read, and Serializable balance throughput against anomalies.',
        ],
        realWorldAnalogy:
          'A bank transfer: subtracting $100 from Account A and adding $100 to Account B must both happen together; money can never vanish mid-flight.',
        takeaway:
          'Durability is achieved through write-ahead logging; a committed transaction will survive an immediate total power failure.',
      },
    };
  }

  // 8. Blockchain & Consensus
  if (p.includes('blockchain') || p.includes('crypto') || p.includes('bitcoin') || p.includes('consensus')) {
    return {
      title: 'Blockchain Proof-of-Work Consensus',
      type: 'flowchart',
      nodes: [
        { label: 'Transaction Broadcast', sublabel: 'Digitally signed transactions enter the peer-to-peer mempool', type: 'start' },
        { label: 'Block Assembly & Merkle Root', sublabel: 'Miner groups valid transactions and computes Merkle tree root', type: 'process' },
        { label: 'Nonce Mining: SHA-256 Hash < Target', sublabel: 'Iterate nonce until double-SHA256 satisfies difficulty', type: 'decision' },
        { label: 'Block Broadcast & P2P Validation', sublabel: 'Nodes verify cryptographic signature and proof-of-work', type: 'process' },
        { label: 'Appended to Distributed Ledger', sublabel: 'Block linked via previous block hash; miner receives block reward', type: 'end' },
      ],
      lessonNotes: {
        title: 'Cryptographic Decentralized Consensus',
        overview:
          'Blockchain establishes immutable shared state across mutually untrusted nodes through cryptographic hash chaining, asymmetric signatures, and thermodynamic proof-of-work.',
        keyPrinciples: [
          'Hash Chaining: Modifying any historical block alters all downstream hashes, immediately alerting peers.',
          'Byzantine Fault Tolerance: The network reaches consensus even if malicious nodes transmit conflicting data.',
          'Difficulty Adjustment: Mining difficulty recalibrates automatically to maintain steady block arrival intervals.',
        ],
        realWorldAnalogy:
          'A shared ledger where every page is sealed with a unique wax stamp that contains the imprint of the previous page; tearing out a page destroys every subsequent seal.',
        takeaway:
          'Security is guaranteed by computational work: rewriting history requires out-computing the entire remainder of the network.',
      },
    };
  }

  // 9. Quantum Computing
  if (p.includes('quantum') || p.includes('qubit') || p.includes('superposition') || p.includes('entanglement')) {
    return {
      title: 'Quantum Algorithm Execution Pipeline',
      type: 'flowchart',
      nodes: [
        { label: 'State Initialization |0...0⟩', sublabel: 'Cool superconducting qubits to ground state in cryostat (15 mK)', type: 'start' },
        { label: 'Hadamard Superposition Gate', sublabel: 'Put qubits into equal probability linear superposition (|0⟩ + |1⟩)/√2', type: 'process' },
        { label: 'CNOT Entanglement & Quantum Logic', sublabel: 'Create Bell pairs and manipulate phase interference patterns', type: 'decision' },
        { label: 'Constructive / Destructive Interference', sublabel: 'Amplify probability amplitude of correct answer states', type: 'process' },
        { label: 'Wavefunction Collapse & Readout', sublabel: 'Measurement collapses superposition into classical binary bits', type: 'end' },
      ],
      lessonNotes: {
        title: 'Quantum Information & Superposition',
        overview:
          'Quantum computers leverage linear superposition and entanglement to explore vast combinatorial solution spaces simultaneously, using quantum interference to cancel incorrect paths.',
        keyPrinciples: [
          'Qubit State: Represented as α|0⟩ + β|1⟩ on the Bloch sphere where |α|² + |β|² = 1.',
          'Quantum Interference: Negative and positive amplitudes cancel wrong solutions and amplify true solutions.',
          'No-Cloning Theorem: An unknown quantum state cannot be copied without collapsing it.',
        ],
        realWorldAnalogy:
          'A maze solver where a classical mouse tests one hallway at a time, but a quantum fluid floods all corridors simultaneously, emerging at the exit instantly.',
        takeaway:
          'Quantum speedup does not mean running faster clocks; it means solving exponential search problems in polynomial steps.',
      },
    };
  }

  // 10. Sorting Algorithms (QuickSort)
  if (p.includes('sort') || p.includes('quicksort') || p.includes('mergesort')) {
    return {
      title: 'QuickSort Divide-and-Conquer Algorithm',
      type: 'flowchart',
      nodes: [
        { label: 'Choose Pivot Element', sublabel: 'Select pivot (median-of-three, first, or random index)', type: 'start' },
        { label: 'Partition Array: Elements < Pivot', sublabel: 'Two-pointer scan places smaller values left, larger right', type: 'process' },
        { label: 'Is Subarray Length <= 1?', sublabel: 'Base case evaluation for recursion termination', type: 'decision' },
        { label: 'Recursive QuickSort on Sub-arrays', sublabel: 'Recursively sort Left and Right partitions', type: 'process' },
        { label: 'Combined Sorted Array', sublabel: 'In-place sorted array with O(N log N) average time complexity', type: 'end' },
      ],
      lessonNotes: {
        title: 'Partition-Based In-Place Sorting',
        overview:
          'QuickSort is an efficient, comparison-based divide-and-conquer algorithm that sorts in-place by partitioning an array around a pivot element so no element needs to cross the pivot again.',
        keyPrinciples: [
          'In-Place Efficiency: Requires O(log N) auxiliary call stack space without duplicating arrays.',
          'Pivot Selection: Randomized pivots prevent worst-case O(N²) regression on pre-sorted data.',
          'Cache Locality: Sequential memory scans provide exceptional performance on modern CPU caches.',
        ],
        realWorldAnalogy:
          'Sorting students by height: pick one student, have everyone shorter stand to their left and everyone taller to their right, then repeat within each sub-group.',
        takeaway:
          'QuickSort outperforms MergeSort in practice because of superior CPU cache locality and zero auxiliary buffer allocation.',
      },
    };
  }

  // 11. Mindmap Format Request
  if (p.includes('mindmap') || p.includes('radial') || p.includes('concept map')) {
    const topic =
      prompt.replace(/(create|draw|make|a|mindmap|of|for|about|whiteboard|lesson)/gi, '').trim().slice(0, 32) || 'Core Subject';
    return {
      title: `Mindmap: ${topic}`,
      type: 'mindmap',
      nodes: [
        { label: topic, sublabel: 'Central Core', type: 'start' },
        { label: '1. Theoretical Foundations', sublabel: 'Prerequisites, Definitions & Axioms', type: 'process' },
        { label: '2. Architecture & Components', sublabel: 'Structural Building Blocks', type: 'process' },
        { label: '3. Execution & Workflow', sublabel: 'Algorithmic Pipelines & Operations', type: 'decision' },
        { label: '4. Real-World Applications', sublabel: 'Industry Use-cases & Best Practices', type: 'end' },
      ],
      lessonNotes: {
        title: `Comprehensive Map: ${topic}`,
        overview: `A structured conceptual decomposition of ${topic}, organizing foundational axioms, architectural mechanics, and downstream implementations into a connected visual taxonomy.`,
        keyPrinciples: [
          'Core Hub: The central anchor establishes definition, scope, and problem boundaries.',
          'Primary Branches: Major conceptual categories radiate outwards from first principles.',
          'Leaf Nodes: Concrete parameters, equations, and applications form the perimeter.',
        ],
        realWorldAnalogy:
          'A tree trunk providing structural nourishment to primary branches, which subdivide into twigs and leaves.',
        takeaway:
          'Mastering any complex topic requires understanding how perimeter applications tie back to the central core.',
      },
    };
  }

  // 12. Smart Universal Synthesizer for ANY Arbitrary Topic
  const clean =
    prompt
      .replace(/(draw|create|make|explain|teach|roadmap|flowchart|diagram|of|for|about|how does|how do|works|work)/gi, '')
      .replace(/[^\w\s]/g, '')
      .trim()
      .split(/\s+/)
      .slice(0, 4)
      .join(' ') || 'Core Subject';

  const titleTopic = clean.charAt(0).toUpperCase() + clean.slice(1);

  return {
    title: `${titleTopic} Process & Architecture`,
    type: 'flowchart',
    nodes: [
      { label: `1. Input & Context: ${titleTopic}`, sublabel: 'Initialization, ingestion & parameter configuration', type: 'start' },
      { label: '2. Data Preprocessing & Validation', sublabel: 'Sanitize inputs, verify constraints & build environment', type: 'process' },
      { label: '3. Core Mechanistic Pivot', sublabel: 'Apply primary algorithmic rule, transformation or decision logic', type: 'decision' },
      { label: '4. Execution & State Convergence', sublabel: 'Synthesize operational steps and resolve state transitions', type: 'process' },
      { label: `5. Outcome: Verified ${titleTopic}`, sublabel: 'Final stabilized output ready for downstream deployment', type: 'end' },
    ],
    lessonNotes: {
      title: `Pedagogical Breakdown: ${titleTopic}`,
      overview: `A rigorous systematic overview of ${titleTopic}. This workflow diagrams how inputs are ingested, validated, transformed via core mechanistic rules, and brought to a verified final state.`,
      keyPrinciples: [
        `Systemic Inputs: Precision in initial parameters determines downstream correctness.`,
        `Core Pivot: The intermediate decision gate guarantees adherence to domain invariants.`,
        `Verification: Systematic output validation prevents silent degradation and ensures reproducibility.`,
      ],
      realWorldAnalogy: `A modern automated assembly line where raw materials are inspected at entry, machined with tight tolerances, quality-tested at the pivot station, and packaged for delivery.`,
      takeaway: `Understanding ${titleTopic} requires viewing it as an interconnected pipeline of discrete, verifiable transformations.`,
    },
  };
}

// ── Agent Drawing Engine ──────────────────────────────────────────────────────
class AgentDrawingService {
  private isDrawing = false;

  public async drawOnCanvas(promptText: string): Promise<boolean> {
    if (this.isDrawing) return false;
    this.isDrawing = true;

    const store = useStore.getState();
    const { setAgentState, setActiveView } = store;

    // Ensure whiteboard view is active
    setActiveView('board');

    // Give React 1 frame to ensure DOM canvas is rendered and measurable
    await new Promise((resolve) => setTimeout(resolve, 80));

    // 1. Dynamic AI Generation: Attempt server Gemma 4 generation with fast timeout
    let diagram: DiagramData | null = null;

    try {
      setAgentState({
        isThinking: true,
        isActing: true,
        agentMessage: `Reasoning with Gemma AI: "${promptText.slice(0, 36)}..."`,
        cursorPosition: { x: 500, y: 180 },
      });

      const aiPromise = aiService.generateBoardLesson(promptText);
      const timeoutPromise = new Promise<{ lesson: BoardLessonData }>((_, reject) =>
        setTimeout(() => reject(new Error('AI board lesson timeout')), 20000)
      );

      const res = await Promise.race([aiPromise, timeoutPromise]);
      if (res?.lesson) {
        diagram = {
          title: res.lesson.title || promptText,
          type: res.lesson.type || (res.lesson.svg ? 'svg' : 'flowchart'),
          svg: res.lesson.svg,
          nodes: (res.lesson.nodes || []).map((n) => ({
            label: n.label,
            sublabel: n.sublabel,
            type: n.type,
          })),
          lessonNotes: res.lesson.lessonNotes,
        };
      }
    } catch (aiErr) {
      console.warn('[AgentDrawingService] Dynamic AI generation fallback to catalog:', aiErr);
    }

    // Fall back to offline educational catalog if AI generation timed out or failed
    if (!diagram) {
      diagram = parseEducationalPrompt(promptText);
    }

    try {
      // 2. Obtain Fabric canvas reference with polling
      let fCanvas = (window as any).__KIMIWISE_CANVAS__;
      if (!fCanvas) {
        for (let attempt = 0; attempt < 15; attempt++) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          fCanvas = (window as any).__KIMIWISE_CANVAS__;
          if (fCanvas) break;
        }
      }

      if (!fCanvas || !FabricClass) {
        setAgentState({
          isThinking: false,
          isActing: false,
          agentMessage: `Canvas ready: please click the board to view lesson.`,
        });
        return false;
      }

      // Ensure dimensions are properly calibrated
      const containerW =
        fCanvas.width && fCanvas.width > 200
          ? fCanvas.width
          : typeof window !== 'undefined'
          ? window.innerWidth - 80
          : 1200;
      const containerH =
        fCanvas.height && fCanvas.height > 200
          ? fCanvas.height
          : typeof window !== 'undefined'
          ? window.innerHeight - 120
          : 800;

      if (!fCanvas.width || fCanvas.width <= 0) {
        fCanvas.setWidth(containerW);
        fCanvas.setHeight(containerH);
        fCanvas.calcOffset();
      }

      // 3. Clear existing objects on current slide to draw fresh lesson
      fCanvas.clear();
      fCanvas.backgroundColor = 'transparent';
      fCanvas.requestRenderAll();
      (window as any).__KIMIWISE_SYNC_GRID__?.();

      const cx = Math.max(320, containerW / 2);
      const cy = Math.max(260, containerH / 2);

      await new Promise((resolve) => setTimeout(resolve, 150));

      // 4. Animate Agent Drawing Step by Step
      setAgentState({
        isThinking: false,
        isActing: true,
        agentMessage: `KimiWise Agent Illustrating: "${diagram.title}"`,
      });

      if (diagram.svg) {
        await this.drawSvgIllustration(diagram, cx, cy, containerW, fCanvas, setAgentState);
      } else if (diagram.type === 'mindmap') {
        await this.drawMindmap(diagram, cx, cy, containerW, fCanvas, setAgentState);
      } else {
        await this.drawFlowchart(diagram, cx, cy, containerW, fCanvas, setAgentState);
      }

      // 5. Save canvas state to store slide
      const currentIdx = useStore.getState().canvas.currentPageIndex;
      const currentSlides = [...useStore.getState().canvas.slides];
      if (currentSlides[currentIdx]) {
        currentSlides[currentIdx] = {
          ...currentSlides[currentIdx],
          canvasJson: fCanvas.toJSON(),
        };
      }
      const canvasObjects = fCanvas.getObjects().map((obj: any) => ({
        id: obj.id || String(Math.random()),
        type: obj.type,
        left: obj.left,
        top: obj.top,
        width: obj.width * (obj.scaleX || 1),
        height: obj.height * (obj.scaleY || 1),
        fill: obj.fill || '#ffffff',
        angle: obj.angle || 0,
      }));
      useStore.setState((s) => ({
        canvas: {
          ...s.canvas,
          slides: currentSlides,
          canvasObjects,
        },
      }));
      fCanvas.renderAll();

      // 6. Drawing Complete!
      setAgentState({
        isThinking: false,
        isActing: false,
        agentMessage: `✨ Lesson complete: "${diagram.title}" & pedagogical notes drawn on whiteboard!`,
      });

      return true;
    } catch (err: any) {
      console.error('[AgentDrawingService] Error drawing:', err);
      setAgentState({
        isThinking: false,
        isActing: false,
        agentMessage: `Completed: visual ready on canvas.`,
      });
      return false;
    } finally {
      this.isDrawing = false;
    }
  }

  // ── Draw Flowchart / Roadmap (Left Side) + Lesson Card (Right Side) ─────────
  private async drawFlowchart(
    diagram: DiagramData,
    cx: number,
    cy: number,
    containerW: number,
    fCanvas: any,
    setAgentState: (state: any) => void
  ) {
    const nodes = diagram.nodes;
    const hasNotes = Boolean(diagram.lessonNotes);

    // If notes exist and canvas has enough space, shift flowchart left and notes right
    const isDualPane = hasNotes && containerW >= 850;
    const flowX = isDualPane ? Math.max(200, cx - 250) : cx;
    const notesX = isDualPane ? Math.min(containerW - 250, cx + 250) : cx;

    const spacing = 110;
    const totalFlowH = nodes.length * spacing;
    const startY = Math.max(75, cy - totalFlowH / 2 + 25);

    // ── Phase 1: Draw Sequential Nodes on Left ────────────────────────────────
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const nx = flowX;
      const ny = startY + i * spacing;

      // A. Move Agent Cursor to Node Coordinate
      setAgentState({
        cursorPosition: { x: nx, y: ny },
        agentMessage: `Drawing Step ${i + 1}/${nodes.length}: ${node.label}`,
      });

      await new Promise((r) => setTimeout(r, 220));

      // B. Create Shape Object with exact child offsets
      let shapeGroup: any;
      const boxW = 310;

      if (node.type === 'start' || node.type === 'end') {
        const isStart = node.type === 'start';
        const bg = new FabricClass.Rect({
          left: 0,
          top: 0,
          width: boxW,
          height: 52,
          rx: 26,
          ry: 26,
          fill: isStart ? '#059669' : '#4f46e5',
          stroke: '#ffffff',
          strokeWidth: 2,
          originX: 'center',
          originY: 'center',
          shadow: new FabricClass.Shadow({
            color: isStart ? 'rgba(5,150,105,0.25)' : 'rgba(79,70,229,0.25)',
            blur: 14,
            offsetY: 4,
          }),
        });

        const titleTxt = new FabricClass.Text(node.label, {
          left: 0,
          top: node.sublabel ? -7 : 0,
          fontSize: 13,
          fill: '#ffffff',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 'bold',
          originX: 'center',
          originY: 'center',
        });

        const elements = [bg, titleTxt];
        if (node.sublabel) {
          const subTxt = new FabricClass.Text(wrapText(node.sublabel, 44), {
            left: 0,
            top: 11,
            fontSize: 9.5,
            fill: 'rgba(255,255,255,0.88)',
            fontFamily: 'Inter, sans-serif',
            originX: 'center',
            originY: 'center',
          });
          elements.push(subTxt);
        }

        shapeGroup = new FabricClass.Group(elements, {
          left: nx,
          top: ny,
          originX: 'center',
          originY: 'center',
          id: `node_${i}`,
          selectable: true,
        });
      } else if (node.type === 'decision') {
        const diamond = new FabricClass.Polygon(
          [
            { x: 0, y: -40 },
            { x: 160, y: 0 },
            { x: 0, y: 40 },
            { x: -160, y: 0 },
          ],
          {
            left: 0,
            top: 0,
            fill: '#fef3c7',
            stroke: '#f59e0b',
            strokeWidth: 2,
            originX: 'center',
            originY: 'center',
            shadow: new FabricClass.Shadow({ color: 'rgba(245,158,11,0.25)', blur: 12, offsetY: 3 }),
          }
        );

        const titleTxt = new FabricClass.Text(node.label, {
          left: 0,
          top: node.sublabel ? -7 : 0,
          fontSize: 12.5,
          fill: '#78350f',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 'bold',
          originX: 'center',
          originY: 'center',
        });

        const elements = [diamond, titleTxt];
        if (node.sublabel) {
          const subTxt = new FabricClass.Text(wrapText(node.sublabel, 42), {
            left: 0,
            top: 11,
            fontSize: 9.5,
            fill: '#92400e',
            fontFamily: 'Inter, sans-serif',
            originX: 'center',
            originY: 'center',
          });
          elements.push(subTxt);
        }

        shapeGroup = new FabricClass.Group(elements, {
          left: nx,
          top: ny,
          originX: 'center',
          originY: 'center',
          id: `node_${i}`,
          selectable: true,
        });
      } else {
        const cardBg = new FabricClass.Rect({
          left: 0,
          top: 0,
          width: boxW,
          height: 54,
          rx: 14,
          ry: 14,
          fill: '#f0f7ff',
          stroke: '#3b82f6',
          strokeWidth: 2,
          originX: 'center',
          originY: 'center',
          shadow: new FabricClass.Shadow({ color: 'rgba(59,130,246,0.18)', blur: 12, offsetY: 3 }),
        });

        const titleTxt = new FabricClass.Text(node.label, {
          left: 0,
          top: node.sublabel ? -7 : 0,
          fontSize: 13,
          fill: '#1e3a8a',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 'bold',
          originX: 'center',
          originY: 'center',
        });

        const elements = [cardBg, titleTxt];
        if (node.sublabel) {
          const subTxt = new FabricClass.Text(wrapText(node.sublabel, 44), {
            left: 0,
            top: 11,
            fontSize: 9.5,
            fill: '#2563eb',
            fontFamily: 'Inter, sans-serif',
            originX: 'center',
            originY: 'center',
          });
          elements.push(subTxt);
        }

        shapeGroup = new FabricClass.Group(elements, {
          left: nx,
          top: ny,
          originX: 'center',
          originY: 'center',
          id: `node_${i}`,
          selectable: true,
        });
      }

      shapeGroup.setCoords();
      fCanvas.add(shapeGroup);
      fCanvas.requestRenderAll();

      // C. Draw Connecting Arrow from previous node
      if (i > 0) {
        const prevY = startY + (i - 1) * spacing + 27;
        const curY = ny - 27;

        setAgentState({
          cursorPosition: { x: nx, y: (prevY + curY) / 2 },
          agentMessage: `Connecting Step ${i} → Step ${i + 1}`,
        });

        await new Promise((r) => setTimeout(r, 110));

        const line = new FabricClass.Line([nx, prevY, nx, curY], {
          stroke: '#3b82f6',
          strokeWidth: 2.5,
          selectable: false,
          evented: false,
        });

        const arrowHead = new FabricClass.Triangle({
          left: nx,
          top: curY,
          originX: 'center',
          originY: 'center',
          angle: 180,
          width: 12,
          height: 12,
          fill: '#3b82f6',
          selectable: false,
          evented: false,
        });

        fCanvas.add(line);
        fCanvas.add(arrowHead);
        fCanvas.requestRenderAll();
      }

      await new Promise((r) => setTimeout(r, 120));
    }

    // ── Phase 2: Draw Blackboard Lesson Note Card on Right ─────────────────────
    if (diagram.lessonNotes && isDualPane) {
      await this.drawLessonNotesCard(
        diagram.lessonNotes,
        notesX,
        startY,
        totalFlowH,
        fCanvas,
        setAgentState
      );
    }
  }

  // ── Draw Blackboard Lesson Note Card with Rich Text Sections ────────────────
  private async drawLessonNotesCard(
    notes: LessonNotes,
    notesX: number,
    startY: number,
    totalFlowH: number,
    fCanvas: any,
    setAgentState: (state: any) => void
  ) {
    const cardW = 440;
    const cardH = Math.max(470, totalFlowH + 40);
    const cardLeft = notesX - cardW / 2;
    const cardTop = Math.max(50, startY - 25);

    // 1. Move Agent Cursor to Card Header
    setAgentState({
      cursorPosition: { x: notesX, y: cardTop + 30 },
      agentMessage: `Writing Blackboard Lesson Notes: "${notes.title}"`,
    });

    await new Promise((r) => setTimeout(r, 260));

    // Outer Card Container (Clean whiteboard card with subtle slate border)
    const cardBg = new FabricClass.Rect({
      left: cardLeft,
      top: cardTop,
      width: cardW,
      height: cardH,
      rx: 16,
      ry: 16,
      fill: '#ffffff',
      stroke: '#cbd5e1',
      strokeWidth: 1.5,
      shadow: new FabricClass.Shadow({
        color: 'rgba(15, 23, 42, 0.08)',
        blur: 24,
        offsetY: 6,
      }),
      selectable: true,
    });
    fCanvas.add(cardBg);

    // Card Header Banner (Dark Indigo)
    const headerBg = new FabricClass.Rect({
      left: cardLeft,
      top: cardTop,
      width: cardW,
      height: 48,
      rx: 16,
      ry: 16,
      fill: '#0f172a',
      selectable: false,
    });
    fCanvas.add(headerBg);

    const headerTag = new FabricClass.Text('📚 BLACKBOARD LESSON NOTES & CONCEPTS', {
      left: cardLeft + 20,
      top: cardTop + 10,
      fontSize: 10,
      fill: '#38bdf8',
      fontFamily: 'Inter, sans-serif',
      fontWeight: 'bold',
      selectable: false,
    });
    fCanvas.add(headerTag);

    const headerTitle = new FabricClass.Text(notes.title || 'Lesson Overview', {
      left: cardLeft + 20,
      top: cardTop + 25,
      fontSize: 13,
      fill: '#ffffff',
      fontFamily: 'Inter, sans-serif',
      fontWeight: 'bold',
      selectable: false,
    });
    fCanvas.add(headerTitle);

    fCanvas.requestRenderAll();
    await new Promise((r) => setTimeout(r, 180));

    // 2. Overview Section
    setAgentState({
      cursorPosition: { x: notesX, y: cardTop + 90 },
      agentMessage: 'Writing Conceptual Overview...',
    });

    const overviewLabel = new FabricClass.Text('📖 Conceptual Overview & Mechanism', {
      left: cardLeft + 20,
      top: cardTop + 62,
      fontSize: 11,
      fill: '#475569',
      fontFamily: 'Inter, sans-serif',
      fontWeight: 'bold',
      selectable: false,
    });
    fCanvas.add(overviewLabel);

    const overviewBody = new FabricClass.Text(wrapText(notes.overview, 52), {
      left: cardLeft + 20,
      top: cardTop + 80,
      fontSize: 10.5,
      fill: '#1e293b',
      fontFamily: 'Inter, sans-serif',
      lineHeight: 1.35,
      selectable: true,
    });
    fCanvas.add(overviewBody);

    fCanvas.requestRenderAll();
    await new Promise((r) => setTimeout(r, 200));

    // 3. Core Principles Section
    setAgentState({
      cursorPosition: { x: notesX, y: cardTop + 175 },
      agentMessage: 'Detailing Core Pedagogical Principles...',
    });

    const principlesLabel = new FabricClass.Text('⚡ Key Principles & Theoretical Invariants', {
      left: cardLeft + 20,
      top: cardTop + 155,
      fontSize: 11,
      fill: '#475569',
      fontFamily: 'Inter, sans-serif',
      fontWeight: 'bold',
      selectable: false,
    });
    fCanvas.add(principlesLabel);

    const bulletLines = (notes.keyPrinciples || []).map((p) => `• ${p}`).join('\n');
    const principlesBody = new FabricClass.Text(wrapText(bulletLines, 50), {
      left: cardLeft + 20,
      top: cardTop + 175,
      fontSize: 10,
      fill: '#334155',
      fontFamily: 'Inter, sans-serif',
      lineHeight: 1.35,
      selectable: true,
    });
    fCanvas.add(principlesBody);

    fCanvas.requestRenderAll();
    await new Promise((r) => setTimeout(r, 200));

    // 4. Real-World Analogy Callout Box
    setAgentState({
      cursorPosition: { x: notesX, y: cardTop + 295 },
      agentMessage: 'Writing Intuitive Classroom Analogy...',
    });

    const analogyBox = new FabricClass.Rect({
      left: cardLeft + 16,
      top: cardTop + 270,
      width: cardW - 32,
      height: 90,
      rx: 10,
      ry: 10,
      fill: '#fffbeb',
      stroke: '#fde68a',
      strokeWidth: 1.5,
      selectable: true,
    });
    fCanvas.add(analogyBox);

    const analogyLabel = new FabricClass.Text('💡 Intuitive Classroom Analogy', {
      left: cardLeft + 28,
      top: cardTop + 280,
      fontSize: 10.5,
      fill: '#b45309',
      fontFamily: 'Inter, sans-serif',
      fontWeight: 'bold',
      selectable: false,
    });
    fCanvas.add(analogyLabel);

    const analogyText = new FabricClass.Text(wrapText(notes.realWorldAnalogy, 48), {
      left: cardLeft + 28,
      top: cardTop + 300,
      fontSize: 10,
      fill: '#78350f',
      fontFamily: 'Inter, sans-serif',
      lineHeight: 1.3,
      selectable: true,
    });
    fCanvas.add(analogyText);

    fCanvas.requestRenderAll();
    await new Promise((r) => setTimeout(r, 180));

    // 5. Key Takeaway Callout Box
    setAgentState({
      cursorPosition: { x: notesX, y: cardTop + 395 },
      agentMessage: 'Highlighting Exam & Practical Takeaway...',
    });

    const takeawayBox = new FabricClass.Rect({
      left: cardLeft + 16,
      top: cardTop + 372,
      width: cardW - 32,
      height: 58,
      rx: 10,
      ry: 10,
      fill: '#ecfdf5',
      stroke: '#a7f3d0',
      strokeWidth: 1.5,
      selectable: true,
    });
    fCanvas.add(takeawayBox);

    const takeawayLabel = new FabricClass.Text('🎯 Core Exam & Engineering Takeaway', {
      left: cardLeft + 28,
      top: cardTop + 382,
      fontSize: 10.5,
      fill: '#047857',
      fontFamily: 'Inter, sans-serif',
      fontWeight: 'bold',
      selectable: false,
    });
    fCanvas.add(takeawayLabel);

    const takeawayText = new FabricClass.Text(wrapText(notes.takeaway, 48), {
      left: cardLeft + 28,
      top: cardTop + 400,
      fontSize: 10,
      fill: '#065f46',
      fontFamily: 'Inter, sans-serif',
      fontWeight: 'bold',
      selectable: true,
    });
    fCanvas.add(takeawayText);

    fCanvas.requestRenderAll();
  }

  // ── Draw Radial Mindmap ─────────────────────────────────────────────────────
  private async drawMindmap(
    diagram: DiagramData,
    cx: number,
    cy: number,
    containerW: number,
    fCanvas: any,
    setAgentState: (state: any) => void
  ) {
    const centerNode = diagram.nodes[0];
    const branches = diagram.nodes.slice(1);
    const hasNotes = Boolean(diagram.lessonNotes);

    // Shift center slightly left if notes card is present
    const mapCx = hasNotes && containerW >= 950 ? Math.max(240, cx - 180) : cx;

    // 1. Draw Central Hub
    setAgentState({
      cursorPosition: { x: mapCx, y: cy },
      agentMessage: `Drawing Core Topic: ${centerNode.label}`,
    });
    await new Promise((r) => setTimeout(r, 260));

    const centerRect = new FabricClass.Rect({
      left: 0,
      top: 0,
      width: 240,
      height: 60,
      rx: 18,
      ry: 18,
      fill: '#6366f1',
      stroke: '#4f46e5',
      strokeWidth: 2,
      originX: 'center',
      originY: 'center',
      shadow: new FabricClass.Shadow({ color: 'rgba(99,102,241,0.3)', blur: 16, offsetY: 4 }),
    });

    const centerTxt = new FabricClass.Text(centerNode.label, {
      left: 0,
      top: 0,
      fontSize: 14,
      fill: '#ffffff',
      fontFamily: 'Inter, sans-serif',
      fontWeight: 'bold',
      originX: 'center',
      originY: 'center',
    });

    const centerGroup = new FabricClass.Group([centerRect, centerTxt], {
      left: mapCx,
      top: cy,
      originX: 'center',
      originY: 'center',
      selectable: true,
    });
    centerGroup.setCoords();
    fCanvas.add(centerGroup);
    fCanvas.requestRenderAll();

    // 2. Draw Radial Branches
    const radius = 210;
    for (let i = 0; i < branches.length; i++) {
      const b = branches[i];
      const angle = (i / branches.length) * 2 * Math.PI - Math.PI / 2;
      const bx = mapCx + Math.cos(angle) * radius;
      const by = cy + Math.sin(angle) * radius;

      setAgentState({
        cursorPosition: { x: bx, y: by },
        agentMessage: `Expanding Branch ${i + 1}/${branches.length}: ${b.label}`,
      });
      await new Promise((r) => setTimeout(r, 220));

      // Connecting branch line
      const branchLine = new FabricClass.Line([mapCx, cy, bx, by], {
        stroke: '#a5b4fc',
        strokeWidth: 2.2,
        selectable: false,
        evented: false,
      });
      fCanvas.add(branchLine);

      // Branch node box
      const bRect = new FabricClass.Rect({
        left: 0,
        top: 0,
        width: 190,
        height: 50,
        rx: 14,
        ry: 14,
        fill: '#eff6ff',
        stroke: '#6366f1',
        strokeWidth: 1.8,
        originX: 'center',
        originY: 'center',
        shadow: new FabricClass.Shadow({ color: 'rgba(0,0,0,0.06)', blur: 10, offsetY: 2 }),
      });

      const bTxt = new FabricClass.Text(b.label, {
        left: 0,
        top: b.sublabel ? -7 : 0,
        fontSize: 12,
        fill: '#1e1b4b',
        fontFamily: 'Inter, sans-serif',
        fontWeight: 'bold',
        originX: 'center',
        originY: 'center',
      });

      const elements = [bRect, bTxt];
      if (b.sublabel) {
        const sub = new FabricClass.Text(wrapText(b.sublabel, 26), {
          left: 0,
          top: 10,
          fontSize: 9,
          fill: '#6366f1',
          fontFamily: 'Inter, sans-serif',
          originX: 'center',
          originY: 'center',
        });
        elements.push(sub);
      }

      const branchGroup = new FabricClass.Group(elements, {
        left: bx,
        top: by,
        originX: 'center',
        originY: 'center',
        selectable: true,
      });
      branchGroup.setCoords();
      fCanvas.add(branchGroup);
      fCanvas.requestRenderAll();
    }

    // 3. Draw lesson notes card on right if room exists
    if (diagram.lessonNotes && containerW >= 950) {
      const notesX = Math.min(containerW - 240, mapCx + 380);
      await this.drawLessonNotesCard(
        diagram.lessonNotes,
        notesX,
        cy - 200,
        450,
        fCanvas,
        setAgentState
      );
    }
  }

  // ── Draw SVG Illustration with High Resolution Vector Group ────────────────
  private async drawSvgIllustration(
    diagram: DiagramData,
    cx: number,
    cy: number,
    containerW: number,
    fCanvas: any,
    setAgentState: (state: any) => void
  ): Promise<boolean> {
    if (!diagram.svg) return false;
    const hasNotes = Boolean(diagram.lessonNotes);
    const isDualPane = hasNotes && containerW >= 950;
    const svgX = isDualPane ? Math.max(260, cx - 220) : cx;
    const svgY = cy;

    setAgentState({
      cursorPosition: { x: svgX, y: svgY },
      agentMessage: `Rendering High-Precision Vector Visual: "${diagram.title}"`,
    });
    await new Promise((r) => setTimeout(r, 200));

    return new Promise((resolve) => {
      try {
        FabricClass.loadSVGFromString(diagram.svg, async (objects: any[], options: any) => {
          if (!objects || objects.length === 0) {
            await this.drawFlowchart(diagram, cx, cy, containerW, fCanvas, setAgentState);
            resolve(false);
            return;
          }

          const svgGroup = FabricClass.util.groupSVGElements(objects, options);
          const maxDim = Math.max(svgGroup.width, svgGroup.height) || 450;
          const targetBox = isDualPane ? 440 : 540;
          const scale = targetBox / maxDim;

          svgGroup.set({
            left: svgX,
            top: svgY,
            scaleX: scale,
            scaleY: scale,
            originX: 'center',
            originY: 'center',
            selectable: true,
          });
          svgGroup.setCoords();
          fCanvas.add(svgGroup);
          fCanvas.setActiveObject(svgGroup);
          fCanvas.requestRenderAll();

          // Draw accompanying blackboard notes if available
          if (diagram.lessonNotes && isDualPane) {
            const notesX = Math.min(containerW - 250, cx + 250);
            await this.drawLessonNotesCard(
              diagram.lessonNotes,
              notesX,
              Math.max(60, cy - 220),
              440,
              fCanvas,
              setAgentState
            );
          }
          resolve(true);
        });
      } catch (err) {
        console.warn('[agentDrawingService] SVG load failed:', err);
        resolve(false);
      }
    });
  }
}

export const agentDrawingService = new AgentDrawingService();
