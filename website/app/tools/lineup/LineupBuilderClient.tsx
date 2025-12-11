"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Zap,
  RotateCcw,
  Save,
  Download,
  Upload,
  Trash2,
  GripVertical,
  X,
  Check,
  FolderOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import PlayerSearchModal from "@/components/ui/PlayerSearchModal";

// Types
interface Player {
  id: string;
  name: string;
  team: string;
  teamColor: string;
  imageUrl?: string;
  stats: {
    avg: string;
    power: number;
    speed: number;
    chemistry: { name: string; value: number }[];
  };
}

interface Roster {
  [position: string]: Player | null;
}

interface SavedLineup {
  id: string;
  name: string;
  roster: { [position: string]: string | null }; // Player IDs
  battingOrder: (string | null)[];
  chemistry: number;
  createdAt: number;
}

interface DragSource {
  type: "field" | "batting";
  index: string | number;
}

const POSITIONS = {
  P: { top: "50%", left: "50%", label: "Pitcher" },
  C: { top: "85%", left: "50%", label: "Catcher" },
  "1B": { top: "50%", left: "80%", label: "First Base" },
  "2B": { top: "20%", left: "65%", label: "Second Base" },
  "3B": { top: "50%", left: "20%", label: "Third Base" },
  SS: { top: "20%", left: "35%", label: "Shortstop" },
  LF: { top: "10%", left: "15%", label: "Left Field" },
  CF: { top: "5%", left: "50%", label: "Center Field" },
  RF: { top: "10%", left: "85%", label: "Right Field" },
};

const STORAGE_KEY = "comets-lineup-builder";

interface LineupBuilderClientProps {
  players: Player[];
}

export default function LineupBuilderClient({
  players,
}: LineupBuilderClientProps) {
  // Field roster state
  const [roster, setRoster] = useState<Roster>({
    P: null,
    C: null,
    "1B": null,
    "2B": null,
    "3B": null,
    SS: null,
    LF: null,
    CF: null,
    RF: null,
  });

  // Batting order state
  const [battingOrder, setBattingOrder] = useState<(Player | null)[]>(
    Array(9).fill(null)
  );

  // Saved lineups
  const [savedLineups, setSavedLineups] = useState<SavedLineup[]>([]);

  // Drag & drop state
  const [draggedPlayer, setDraggedPlayer] = useState<Player | null>(null);
  const [dragSource, setDragSource] = useState<DragSource | null>(null);
  const [dropTarget, setDropTarget] = useState<DragSource | null>(null);

  // Modal state
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [selectingFor, setSelectingFor] = useState<{
    type: "field" | "batting";
    position: string | number;
  } | null>(null);

  // Save dialog state
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [saveLineupName, setSaveLineupName] = useState("");

  // Status messages (toasts)
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Mobile tab state
  const [activeTab, setActiveTab] = useState<"field" | "batting">("field");

  // Hovered position for tooltip
  const [hoveredPosition, setHoveredPosition] = useState<string | null>(null);

  // Load saved lineups from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setSavedLineups(JSON.parse(saved));
      }
    } catch {
      console.error("Failed to load saved lineups");
    }
  }, []);

  // Auto-dismiss status messages
  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  // Show status message
  const showStatus = (type: "success" | "error", text: string) => {
    setStatusMessage({ type, text });
  };

  // Calculate chemistry score
  const calculateChemistry = useCallback(() => {
    let totalChemistry = 0;
    const filledPositions = Object.entries(roster).filter(
      ([, player]) => player !== null
    );

    filledPositions.forEach(([, player]) => {
      if (player) {
        filledPositions.forEach(([, otherPlayer]) => {
          if (otherPlayer && player.id !== otherPlayer.id) {
            const chemistryValue =
              player.stats.chemistry.find((c) => c.name === otherPlayer.name)
                ?.value || 0;
            if (chemistryValue >= 100) {
              totalChemistry++;
            }
          }
        });
      }
    });

    return totalChemistry;
  }, [roster]);

  const chemistryScore = calculateChemistry();
  const filledFieldPositions = Object.values(roster).filter(
    (p) => p !== null
  ).length;
  const filledBattingSlots = battingOrder.filter((p) => p !== null).length;

  // Get players already in lineup
  const playersInLineup = new Set([
    ...Object.values(roster)
      .filter((p) => p !== null)
      .map((p) => p!.id),
    ...battingOrder.filter((p) => p !== null).map((p) => p!.id),
  ]);

  // Get available players for search modal
  const availablePlayers = players.filter((p) => !playersInLineup.has(p.id));

  // Find first empty batting slot
  const findEmptyBattingSlot = () => {
    return battingOrder.findIndex((p) => p === null);
  };

  // Find first empty field position
  const findEmptyFieldPosition = () => {
    return Object.entries(roster).find(([, player]) => player === null)?.[0];
  };

  // Open modal to select player
  const openModalForField = (position: string) => {
    setSelectingFor({ type: "field", position });
    setIsSearchModalOpen(true);
  };

  const openModalForBatting = (slot: number) => {
    setSelectingFor({ type: "batting", position: slot });
    setIsSearchModalOpen(true);
  };

  // Handle player selection from modal
  const handlePlayerSelect = (player: Player) => {
    if (!selectingFor) return;

    if (selectingFor.type === "field") {
      const position = selectingFor.position as string;
      setRoster({ ...roster, [position]: player });

      // Auto-add to batting order if there's an empty slot
      const emptySlot = findEmptyBattingSlot();
      if (emptySlot !== -1 && !battingOrder.some((p) => p?.id === player.id)) {
        const newBatting = [...battingOrder];
        newBatting[emptySlot] = player;
        setBattingOrder(newBatting);
      }
    } else {
      const slot = selectingFor.position as number;
      const newBatting = [...battingOrder];
      newBatting[slot] = player;
      setBattingOrder(newBatting);

      // Auto-add to field if there's an empty position
      const emptyPos = findEmptyFieldPosition();
      if (emptyPos && !Object.values(roster).some((p) => p?.id === player.id)) {
        setRoster({ ...roster, [emptyPos]: player });
      }
    }

    setIsSearchModalOpen(false);
    setSelectingFor(null);
  };

  // Handle position click (for removing or selecting)
  const handlePositionClick = (position: string) => {
    const player = roster[position];
    if (player) {
      // Remove player from both field and batting order
      setRoster({ ...roster, [position]: null });
      setBattingOrder(battingOrder.map((p) => (p?.id === player.id ? null : p)));
    } else {
      // Open modal to select player
      openModalForField(position);
    }
  };

  // Handle batting slot click
  const handleBattingSlotClick = (slot: number) => {
    const player = battingOrder[slot];
    if (player) {
      // Remove player from both batting order and field
      const newBatting = [...battingOrder];
      newBatting[slot] = null;
      setBattingOrder(newBatting);

      // Find and remove from roster
      const posEntry = Object.entries(roster).find(
        ([, p]) => p?.id === player.id
      );
      if (posEntry) {
        setRoster({ ...roster, [posEntry[0]]: null });
      }
    } else {
      // Open modal to select player
      openModalForBatting(slot);
    }
  };

  // Drag & Drop handlers
  const handleDragStart = (player: Player, source: DragSource) => {
    setDraggedPlayer(player);
    setDragSource(source);
  };

  const handleDragEnd = () => {
    setDraggedPlayer(null);
    setDragSource(null);
    setDropTarget(null);
  };

  const handleDragOver = (e: React.DragEvent, target: DragSource) => {
    e.preventDefault();
    setDropTarget(target);
  };

  const handleDragLeave = () => {
    setDropTarget(null);
  };

  const handleDropOnField = (position: string) => {
    if (!draggedPlayer || !dragSource) return;

    const existingPlayer = roster[position];

    if (dragSource.type === "field") {
      // Swap field positions
      const sourcePos = dragSource.index as string;
      setRoster({
        ...roster,
        [sourcePos]: existingPlayer,
        [position]: draggedPlayer,
      });
    } else {
      // From batting to field
      const sourceSlot = dragSource.index as number;
      const newBatting = [...battingOrder];

      if (existingPlayer) {
        // Swap: put existing player in the batting slot
        newBatting[sourceSlot] = existingPlayer;
      } else {
        newBatting[sourceSlot] = null;
      }

      setBattingOrder(newBatting);
      setRoster({ ...roster, [position]: draggedPlayer });
    }

    handleDragEnd();
  };

  const handleDropOnBatting = (slot: number) => {
    if (!draggedPlayer || !dragSource) return;

    const existingPlayer = battingOrder[slot];
    const newBatting = [...battingOrder];

    if (dragSource.type === "batting") {
      // Swap batting slots
      const sourceSlot = dragSource.index as number;
      newBatting[sourceSlot] = existingPlayer;
      newBatting[slot] = draggedPlayer;
    } else {
      // From field to batting
      const sourcePos = dragSource.index as string;

      if (existingPlayer) {
        // Swap: put existing player in the field position
        setRoster({ ...roster, [sourcePos]: existingPlayer });
      } else {
        setRoster({ ...roster, [sourcePos]: null });
      }

      newBatting[slot] = draggedPlayer;
    }

    setBattingOrder(newBatting);
    handleDragEnd();
  };

  // Reset everything
  const handleReset = () => {
    setRoster({
      P: null,
      C: null,
      "1B": null,
      "2B": null,
      "3B": null,
      SS: null,
      LF: null,
      CF: null,
      RF: null,
    });
    setBattingOrder(Array(9).fill(null));
    showStatus("success", "Lineup cleared");
  };

  // Save lineup
  const handleSave = () => {
    if (!saveLineupName.trim()) return;

    const lineupRoster: { [position: string]: string | null } = {};
    Object.entries(roster).forEach(([pos, player]) => {
      lineupRoster[pos] = player?.id || null;
    });

    const newLineup: SavedLineup = {
      id: Date.now().toString(),
      name: saveLineupName.trim(),
      roster: lineupRoster,
      battingOrder: battingOrder.map((p) => p?.id || null),
      chemistry: chemistryScore,
      createdAt: Date.now(),
    };

    const updated = [...savedLineups, newLineup];
    setSavedLineups(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    setIsSaveDialogOpen(false);
    setSaveLineupName("");
    showStatus("success", `Lineup "${newLineup.name}" saved!`);
  };

  // Load lineup
  const handleLoad = (lineup: SavedLineup) => {
    const playerMap = new Map(players.map((p) => [p.id, p]));

    const newRoster: Roster = {
      P: null,
      C: null,
      "1B": null,
      "2B": null,
      "3B": null,
      SS: null,
      LF: null,
      CF: null,
      RF: null,
    };
    Object.entries(lineup.roster).forEach(([pos, playerId]) => {
      if (playerId) {
        newRoster[pos] = playerMap.get(playerId) || null;
      }
    });

    const newBatting = lineup.battingOrder.map(
      (id) => (id ? playerMap.get(id) : null) || null
    );

    setRoster(newRoster);
    setBattingOrder(newBatting);
    showStatus("success", `Loaded "${lineup.name}"`);
  };

  // Delete lineup
  const handleDelete = (id: string) => {
    const updated = savedLineups.filter((l) => l.id !== id);
    setSavedLineups(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    showStatus("success", "Lineup deleted");
  };

  // Export lineup as JSON
  const handleExport = () => {
    const lineupRoster: { [position: string]: string | null } = {};
    Object.entries(roster).forEach(([pos, player]) => {
      lineupRoster[pos] = player?.id || null;
    });

    const exportData = {
      roster: lineupRoster,
      battingOrder: battingOrder.map((p) => p?.id || null),
      chemistry: chemistryScore,
      exportedAt: new Date().toISOString(),
    };

    navigator.clipboard.writeText(JSON.stringify(exportData, null, 2));
    showStatus("success", "Lineup copied to clipboard!");
  };

  // Import lineup from clipboard
  const handleImport = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const data = JSON.parse(text);

      if (data.roster && data.battingOrder) {
        const playerMap = new Map(players.map((p) => [p.id, p]));

        const newRoster: Roster = {
          P: null,
          C: null,
          "1B": null,
          "2B": null,
          "3B": null,
          SS: null,
          LF: null,
          CF: null,
          RF: null,
        };
        Object.entries(data.roster).forEach(([pos, playerId]) => {
          if (playerId && typeof playerId === "string") {
            newRoster[pos] = playerMap.get(playerId) || null;
          }
        });

        const newBatting = data.battingOrder.map(
          (id: string | null) => (id ? playerMap.get(id) : null) || null
        );

        setRoster(newRoster);
        setBattingOrder(newBatting);
        showStatus("success", "Lineup imported!");
      } else {
        showStatus("error", "Invalid lineup format");
      }
    } catch {
      showStatus("error", "Failed to import lineup");
    }
  };

  return (
    <main className="min-h-screen pt-28 pb-12 px-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-comets-blue/5 to-transparent pointer-events-none" />
      <div className="absolute inset-0 grid-pattern opacity-5 pointer-events-none" />

      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2 text-comets-purple mb-2">
            <Users size={20} />
            <span className="font-ui uppercase tracking-widest text-sm font-bold">
              Tactical Manager
            </span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl text-white uppercase leading-none mb-4">
            Lineup Builder
          </h1>
          <p className="text-white/60 max-w-2xl">
            Build your ultimate roster. Click positions to add players, drag to
            reorder. Build chemistry by pairing compatible teammates.
          </p>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-surface-dark border border-white/10 rounded-lg p-4">
            <div className="text-xs font-mono text-white/40 uppercase">
              Field Roster
            </div>
            <div className="text-3xl font-display text-white">
              {filledFieldPositions}/9
            </div>
          </div>

          <div className="bg-surface-dark border border-white/10 rounded-lg p-4">
            <div className="text-xs font-mono text-white/40 uppercase">
              Chemistry
            </div>
            <div className="text-3xl font-display text-comets-cyan flex items-center gap-2">
              <Zap size={24} />
              {chemistryScore}
            </div>
          </div>

          <div className="bg-surface-dark border border-white/10 rounded-lg p-4 flex items-center gap-2">
            <motion.button
              onClick={handleReset}
              className="flex items-center gap-2 text-white/60 hover:text-comets-red transition-colors font-ui uppercase tracking-widest text-sm arcade-press focus-arcade"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RotateCcw size={18} />
              Reset
            </motion.button>
          </div>

          <div className="bg-surface-dark border border-white/10 rounded-lg p-4 flex items-center gap-2 flex-wrap">
            <motion.button
              onClick={() => setIsSaveDialogOpen(true)}
              className="flex items-center gap-1 bg-comets-yellow text-black px-3 py-1.5 rounded-sm font-display uppercase text-xs arcade-press focus-arcade"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Save size={14} />
              Save
            </motion.button>
            <motion.button
              onClick={handleExport}
              className="flex items-center gap-1 bg-comets-cyan/20 text-comets-cyan border border-comets-cyan/30 px-3 py-1.5 rounded-sm font-display uppercase text-xs arcade-press focus-arcade"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download size={14} />
              Export
            </motion.button>
            <motion.button
              onClick={handleImport}
              className="flex items-center gap-1 bg-white/10 text-white/70 border border-white/20 px-3 py-1.5 rounded-sm font-display uppercase text-xs arcade-press focus-arcade"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Upload size={14} />
              Import
            </motion.button>
          </div>
        </motion.div>

        {/* Mobile Tab Navigation */}
        <div className="lg:hidden mb-6">
          <div className="flex bg-surface-dark border border-white/10 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("field")}
              className={cn(
                "flex-1 py-2 px-4 rounded font-display uppercase text-sm transition-all",
                activeTab === "field"
                  ? "bg-comets-cyan/20 text-comets-cyan"
                  : "text-white/50 hover:text-white"
              )}
            >
              ⚾ Field
            </button>
            <button
              onClick={() => setActiveTab("batting")}
              className={cn(
                "flex-1 py-2 px-4 rounded font-display uppercase text-sm transition-all",
                activeTab === "batting"
                  ? "bg-comets-cyan/20 text-comets-cyan"
                  : "text-white/50 hover:text-white"
              )}
            >
              📋 Batting Order
            </button>
          </div>
        </div>

        {/* Main Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Holographic Field */}
          <motion.div
            className={cn(
              "lg:col-span-7",
              activeTab !== "field" && "hidden lg:block"
            )}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="mb-4">
              <h2 className="font-display text-2xl text-white uppercase mb-2">
                Field Positions
              </h2>
              <p className="text-xs font-mono text-white/40">
                Click position to add player • Click filled position to remove
              </p>
            </div>

            {/* The Field */}
            <div className="relative w-full aspect-square max-w-2xl mx-auto perspective-1000">
              {/* Field container */}
              <motion.div
                className="absolute inset-0 transform rotate-x-45 scale-90 bg-black/20 border border-white/10 rounded-full backdrop-blur-sm overflow-hidden"
                animate={{
                  boxShadow: [
                    "0 0 50px rgba(0,243,255,0.1)",
                    "0 0 80px rgba(0,243,255,0.2)",
                    "0 0 50px rgba(0,243,255,0.1)",
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                {/* Grid */}
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage:
                      "linear-gradient(to right, #00F3FF 1px, transparent 1px), linear-gradient(to bottom, #00F3FF 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                  }}
                />

                {/* Diamond */}
                <motion.div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rotate-45 border-2 border-comets-cyan/30"
                  animate={{
                    boxShadow: [
                      "0 0 20px rgba(0,243,255,0.2)",
                      "0 0 40px rgba(0,243,255,0.4)",
                      "0 0 20px rgba(0,243,255,0.2)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />

                {/* Scanning line */}
                <motion.div
                  animate={{ top: ["0%", "100%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 right-0 h-2 bg-comets-cyan/70 blur-sm"
                  style={{ boxShadow: "0 0 20px #00F3FF" }}
                />
              </motion.div>

              {/* Position Nodes */}
              {Object.entries(POSITIONS).map(([pos, coords]) => {
                const player = roster[pos];
                const isHovered = hoveredPosition === pos;
                const isDragOver =
                  dropTarget?.type === "field" && dropTarget?.index === pos;

                return (
                  <motion.button
                    key={pos}
                    draggable={!!player}
                    onDragStart={() =>
                      player && handleDragStart(player, { type: "field", index: pos })
                    }
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => handleDragOver(e, { type: "field", index: pos })}
                    onDragLeave={handleDragLeave}
                    onDrop={() => handleDropOnField(pos)}
                    onClick={() => handlePositionClick(pos)}
                    onMouseEnter={() => setHoveredPosition(pos)}
                    onMouseLeave={() => setHoveredPosition(null)}
                    whileHover={{ scale: 1.3, y: -8 }}
                    whileTap={{ scale: 0.9 }}
                    className={cn(
                      "absolute w-14 h-14 -ml-7 -mt-7 rounded-full border-2 flex flex-col items-center justify-center z-10 transition-all duration-300 cursor-pointer focus-yellow",
                      player
                        ? "border-comets-yellow bg-black shadow-[0_0_15px_#F4D03F]"
                        : isDragOver
                          ? "border-comets-cyan bg-comets-cyan/30 shadow-[0_0_20px_#00F3FF] animate-pulse"
                          : "border-white/20 bg-black/50 hover:border-comets-cyan hover:bg-comets-cyan/10"
                    )}
                    style={{ top: coords.top, left: coords.left }}
                  >
                    {player ? (
                      player.imageUrl ? (
                        <Image
                          src={player.imageUrl}
                          alt={player.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover rounded-full"
                          draggable={false}
                        />
                      ) : (
                        <>
                          <div className="font-bold text-xs text-comets-yellow">
                            {player.name[0]}
                          </div>
                          <div className="text-[8px] text-white/50 font-mono">
                            {pos}
                          </div>
                        </>
                      )
                    ) : (
                      <div className="text-[10px] text-white/50 font-mono">
                        {pos}
                      </div>
                    )}

                    {/* Pulse for filled */}
                    {player && (
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-comets-yellow"
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.5, 0, 0.5],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}

                    {/* Tooltip */}
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute bottom-full mb-2 px-2 py-1 bg-black/90 border border-white/20 rounded text-xs whitespace-nowrap pointer-events-none"
                      >
                        {coords.label}
                        {player && ` - ${player.name}`}
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}

              {/* Chemistry Lines */}
              <svg
                className="absolute inset-0 pointer-events-none"
                style={{ zIndex: 5 }}
              >
                {Object.entries(roster).map(([pos1, player1]) => {
                  if (!player1) return null;
                  return Object.entries(roster).map(([pos2, player2]) => {
                    if (!player2 || pos1 >= pos2) return null;

                    const chemistryValue =
                      player1.stats.chemistry.find(
                        (c) => c.name === player2.name
                      )?.value || 0;
                    if (Math.abs(chemistryValue) < 100) return null;

                    const coords1 = POSITIONS[pos1 as keyof typeof POSITIONS];
                    const coords2 = POSITIONS[pos2 as keyof typeof POSITIONS];
                    const isPositive = chemistryValue >= 100;

                    return (
                      <motion.line
                        key={`${pos1}-${pos2}`}
                        x1={coords1.left}
                        y1={coords1.top}
                        x2={coords2.left}
                        y2={coords2.top}
                        stroke={isPositive ? "#00F3FF" : "#FF3366"}
                        strokeWidth="2"
                        strokeDasharray={isPositive ? "0" : "5,5"}
                        opacity="0.4"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1 }}
                      />
                    );
                  });
                })}
              </svg>
            </div>
          </motion.div>

          {/* Right: Batting Order */}
          <motion.div
            className={cn(
              "lg:col-span-5 space-y-6",
              activeTab !== "batting" && "hidden lg:block"
            )}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            {/* Batting Order */}
            <div className="bg-surface-dark border border-white/10 rounded-lg p-4">
              <h3 className="font-display text-xl text-white uppercase flex items-center gap-2 mb-4">
                <span>⚾</span> Batting Order
                <span className="text-comets-yellow">
                  ({filledBattingSlots}/9)
                </span>
              </h3>

              <div className="space-y-2">
                {battingOrder.map((player, idx) => {
                  const isDragOver =
                    dropTarget?.type === "batting" && dropTarget?.index === idx;

                  return (
                    <motion.div
                      key={idx}
                      draggable={!!player}
                      onDragStart={() =>
                        player &&
                        handleDragStart(player, { type: "batting", index: idx })
                      }
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) =>
                        handleDragOver(e, { type: "batting", index: idx })
                      }
                      onDragLeave={handleDragLeave}
                      onDrop={() => handleDropOnBatting(idx)}
                      onClick={() => handleBattingSlotClick(idx)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer",
                        player
                          ? "bg-black/30 border-white/10 hover:border-comets-cyan/50"
                          : isDragOver
                            ? "bg-comets-cyan/20 border-comets-cyan border-dashed animate-pulse"
                            : "bg-black/10 border-dashed border-white/20 hover:border-comets-cyan/50 hover:bg-comets-cyan/5"
                      )}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {/* Slot Number */}
                      <div
                        className={cn(
                          "w-8 h-8 rounded flex items-center justify-center font-display text-lg",
                          player
                            ? "bg-comets-yellow/20 text-comets-yellow"
                            : "bg-white/5 text-white/30"
                        )}
                      >
                        {idx + 1}
                      </div>

                      {player ? (
                        <>
                          {/* Drag Handle */}
                          <GripVertical
                            size={16}
                            className="text-white/30 cursor-grab"
                          />

                          {/* Avatar */}
                          {player.imageUrl ? (
                            <div
                              className="w-10 h-10 rounded-lg overflow-hidden border-2 flex-shrink-0"
                              style={{ borderColor: player.teamColor }}
                            >
                              <Image
                                src={player.imageUrl}
                                alt={player.name}
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                                draggable={false}
                              />
                            </div>
                          ) : (
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center font-display text-lg border-2 flex-shrink-0"
                              style={{
                                borderColor: player.teamColor,
                                color: player.teamColor,
                                backgroundColor: `${player.teamColor}15`,
                              }}
                            >
                              {player.name[0]}
                            </div>
                          )}

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="font-display text-white truncate">
                              {player.name}
                            </div>
                            <div className="text-xs font-mono text-white/40">
                              {player.team} • {player.stats.avg}
                            </div>
                          </div>

                          {/* Remove button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBattingSlotClick(idx);
                            }}
                            className="p-1 text-white/30 hover:text-comets-red transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <div className="flex-1 text-sm font-mono text-white/30">
                          Click to add batter #{idx + 1}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Saved Lineups */}
            <div className="bg-surface-dark border border-white/10 rounded-lg p-4">
              <h3 className="font-display text-lg text-white uppercase flex items-center gap-2 mb-3">
                <FolderOpen size={18} />
                Saved Lineups ({savedLineups.length})
              </h3>

              {savedLineups.length === 0 ? (
                <div className="text-sm font-mono text-white/30 py-4 text-center">
                  No saved lineups yet
                </div>
              ) : (
                <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                  {savedLineups.map((lineup) => (
                    <div
                      key={lineup.id}
                      className="flex items-center gap-3 p-3 bg-black/20 rounded-lg border border-white/5"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-display text-white truncate">
                          {lineup.name}
                        </div>
                        <div className="text-xs font-mono text-white/40">
                          Chemistry: {lineup.chemistry} •{" "}
                          {new Date(lineup.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <motion.button
                        onClick={() => handleLoad(lineup)}
                        className="p-2 text-comets-cyan hover:bg-comets-cyan/20 rounded transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Check size={16} />
                      </motion.button>
                      <motion.button
                        onClick={() => handleDelete(lineup.id)}
                        className="p-2 text-comets-red/60 hover:text-comets-red hover:bg-comets-red/20 rounded transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Trash2 size={16} />
                      </motion.button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Player Search Modal */}
      <PlayerSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => {
          setIsSearchModalOpen(false);
          setSelectingFor(null);
        }}
        onSelect={handlePlayerSelect}
        availablePlayers={availablePlayers}
        title={
          selectingFor?.type === "field"
            ? `Select ${POSITIONS[selectingFor.position as keyof typeof POSITIONS]?.label || "Player"}`
            : `Select Batter #${(selectingFor?.position as number) + 1 || 1}`
        }
      />

      {/* Save Dialog */}
      <AnimatePresence>
        {isSaveDialogOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setIsSaveDialogOpen(false)}
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-surface-dark border border-comets-cyan/30 rounded-xl p-6 w-full max-w-md shadow-[0_0_50px_rgba(0,243,255,0.2)]"
            >
              <h3 className="font-display text-xl text-white uppercase mb-4">
                Save Lineup
              </h3>
              <input
                type="text"
                placeholder="Enter lineup name..."
                value={saveLineupName}
                onChange={(e) => setSaveLineupName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                autoFocus
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 font-mono text-sm focus:outline-none focus:border-comets-cyan focus:shadow-[0_0_10px_rgba(0,243,255,0.3)] transition-all mb-4"
              />
              <div className="flex gap-3">
                <motion.button
                  onClick={() => setIsSaveDialogOpen(false)}
                  className="flex-1 py-2 border border-white/20 rounded-lg text-white/60 font-display uppercase text-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleSave}
                  disabled={!saveLineupName.trim()}
                  className="flex-1 py-2 bg-comets-yellow text-black rounded-lg font-display uppercase text-sm disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Save
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Toast */}
      <AnimatePresence>
        {statusMessage && (
          <motion.div
            initial={{ opacity: 0, x: 50, y: 0 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className={cn(
              "fixed top-24 right-4 z-50 px-4 py-3 rounded-lg border backdrop-blur-sm shadow-lg",
              statusMessage.type === "success"
                ? "bg-comets-cyan/20 border-comets-cyan/50 text-comets-cyan"
                : "bg-comets-red/20 border-comets-red/50 text-comets-red"
            )}
          >
            <div className="flex items-center gap-2 font-mono text-sm">
              {statusMessage.type === "success" ? (
                <Check size={16} />
              ) : (
                <X size={16} />
              )}
              {statusMessage.text}
            </div>
            {/* Progress bar */}
            <motion.div
              className={cn(
                "absolute bottom-0 left-0 h-0.5 rounded-full",
                statusMessage.type === "success"
                  ? "bg-comets-cyan"
                  : "bg-comets-red"
              )}
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 4, ease: "linear" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 243, 255, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 243, 255, 0.5);
        }
      `}</style>
    </main>
  );
}
