"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { EXPERIENCES, getExperience, type Category } from "./data";

export interface Member {
  name: string;
  avatar: string;
  isYou?: boolean;
}

export interface Group {
  id: string;
  name: string;
  code: string;
  members: Member[];
  candidateIds: string[];
  votes: Record<string, Record<string, boolean>>; // votes[member][expId]
  youDone: boolean;
  decidedId?: string;
  plan?: { date: string; time: string };
  expense?: { total: number; perPerson: number; approvals: string[]; approved: boolean };
}

export interface Trip {
  id: string;
  expId: string;
  date: string;
  time: string;
  partySize: number;
  total: number;
  source: "solo" | "group";
  groupName?: string;
}

export interface Taste {
  categories: Category[];
  vibes: string[];
  done: boolean;
}

interface State {
  wishlist: string[];
  taste: Taste;
  trips: Trip[];
  groups: Group[];
  member: boolean; // Groupee+ membership
}

const FRIENDS: Member[] = [
  { name: "Maya", avatar: "https://i.pravatar.cc/120?u=groupee-friend-maya" },
  { name: "Leo", avatar: "https://i.pravatar.cc/120?u=groupee-friend-leo" },
  { name: "Priya", avatar: "https://i.pravatar.cc/120?u=groupee-friend-priya" },
  { name: "Theo", avatar: "https://i.pravatar.cc/120?u=groupee-friend-theo" },
];

const DEFAULT_STATE: State = {
  wishlist: [],
  taste: { categories: [], vibes: [], done: false },
  trips: [],
  groups: [],
  member: false,
};

const KEY = "groupee-state-v1";

interface Ctx extends State {
  toggleWishlist: (id: string) => void;
  isSaved: (id: string) => boolean;
  setTaste: (t: Partial<Taste>) => void;
  bookSolo: (expId: string, date: string, time: string, partySize: number) => void;
  createGroup: (name: string, candidateIds: string[]) => string;
  getGroup: (id: string) => Group | undefined;
  castVote: (groupId: string, expId: string, yes: boolean) => void;
  finishVoting: (groupId: string) => void;
  commitPlan: (groupId: string, date: string, time: string) => void;
  approveExpense: (groupId: string) => void;
  joinMembership: () => void;
}

const GroupeeContext = createContext<Ctx | null>(null);

function code4() {
  const A = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  return Array.from({ length: 4 }, () => A[Math.floor(Math.random() * A.length)]).join("");
}

// seed plausible friend votes so a group "decision" emerges in the demo
function seedFriendVotes(candidateIds: string[]): Record<string, Record<string, boolean>> {
  const votes: Record<string, Record<string, boolean>> = {};
  FRIENDS.forEach((f, fi) => {
    votes[f.name] = {};
    candidateIds.forEach((id, ci) => {
      // bias toward yes, with some variety per friend
      const exp = getExperience(id);
      const base = exp ? (exp.rating - 4.7) * 1.5 : 0.4;
      votes[f.name][id] = Math.random() < 0.45 + base + (fi % 2 === 0 ? 0.1 : -0.05) - ci * 0.04;
    });
  });
  return votes;
}

export function GroupeeProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState({ ...DEFAULT_STATE, ...JSON.parse(raw) });
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      try {
        localStorage.setItem(KEY, JSON.stringify(state));
      } catch {}
    }
  }, [state, hydrated]);

  const toggleWishlist = (id: string) =>
    setState((s) => ({
      ...s,
      wishlist: s.wishlist.includes(id)
        ? s.wishlist.filter((x) => x !== id)
        : [...s.wishlist, id],
    }));

  const isSaved = (id: string) => state.wishlist.includes(id);

  const setTaste = (t: Partial<Taste>) =>
    setState((s) => ({ ...s, taste: { ...s.taste, ...t } }));

  const bookSolo: Ctx["bookSolo"] = (expId, date, time, partySize) => {
    const exp = getExperience(expId);
    if (!exp) return;
    setState((s) => ({
      ...s,
      trips: [
        ...s.trips,
        {
          id: `t-${Date.now()}`,
          expId,
          date,
          time,
          partySize,
          total: exp.price * partySize,
          source: "solo",
        },
      ],
    }));
  };

  const createGroup: Ctx["createGroup"] = (name, candidateIds) => {
    const id = `g-${Date.now()}`;
    const members: Member[] = [
      { name: "You", avatar: "https://i.pravatar.cc/120?u=groupee-you", isYou: true },
      ...FRIENDS.slice(0, 3),
    ];
    const votes = seedFriendVotes(candidateIds);
    votes["You"] = {};
    const group: Group = {
      id,
      name,
      code: code4(),
      members,
      candidateIds,
      votes,
      youDone: false,
    };
    setState((s) => ({ ...s, groups: [...s.groups, group] }));
    return id;
  };

  const getGroup = (id: string) => state.groups.find((g) => g.id === id);

  const castVote: Ctx["castVote"] = (groupId, expId, yes) =>
    setState((s) => ({
      ...s,
      groups: s.groups.map((g) =>
        g.id === groupId
          ? { ...g, votes: { ...g.votes, You: { ...g.votes.You, [expId]: yes } } }
          : g
      ),
    }));

  const finishVoting: Ctx["finishVoting"] = (groupId) =>
    setState((s) => ({
      ...s,
      groups: s.groups.map((g) => {
        if (g.id !== groupId) return g;
        // tally yes-votes across all members
        let best = g.candidateIds[0];
        let bestScore = -1;
        for (const id of g.candidateIds) {
          let score = 0;
          for (const m of g.members) if (g.votes[m.name]?.[id]) score++;
          if (score > bestScore) {
            bestScore = score;
            best = id;
          }
        }
        return { ...g, youDone: true, decidedId: best };
      }),
    }));

  const commitPlan: Ctx["commitPlan"] = (groupId, date, time) =>
    setState((s) => {
      const g = s.groups.find((x) => x.id === groupId);
      if (!g || !g.decidedId) return s;
      const exp = getExperience(g.decidedId);
      const partySize = g.members.length;
      const total = exp ? exp.price * partySize : 0;
      const trip: Trip = {
        id: `t-${Date.now()}`,
        expId: g.decidedId,
        date,
        time,
        partySize,
        total,
        source: "group",
        groupName: g.name,
      };
      return {
        ...s,
        groups: s.groups.map((x) =>
          x.id === groupId
            ? {
                ...x,
                plan: { date, time },
                expense: {
                  total,
                  perPerson: Math.round((total / partySize) * 100) / 100,
                  approvals: x.members.filter((m) => !m.isYou).map((m) => m.name),
                  approved: false,
                },
              }
            : x
        ),
        trips: [...s.trips, trip],
      };
    });

  const approveExpense: Ctx["approveExpense"] = (groupId) =>
    setState((s) => ({
      ...s,
      groups: s.groups.map((g) =>
        g.id === groupId && g.expense
          ? {
              ...g,
              expense: {
                ...g.expense,
                approved: true,
                approvals: g.members.map((m) => m.name),
              },
            }
          : g
      ),
    }));

  const joinMembership = () => setState((s) => ({ ...s, member: true }));

  return (
    <GroupeeContext.Provider
      value={{
        ...state,
        toggleWishlist,
        isSaved,
        setTaste,
        bookSolo,
        createGroup,
        getGroup,
        castVote,
        finishVoting,
        commitPlan,
        approveExpense,
        joinMembership,
      }}
    >
      {children}
    </GroupeeContext.Provider>
  );
}

export function useGroupee() {
  const ctx = useContext(GroupeeContext);
  if (!ctx) throw new Error("useGroupee must be used within GroupeeProvider");
  return ctx;
}

export { FRIENDS, EXPERIENCES };
