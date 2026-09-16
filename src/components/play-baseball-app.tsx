"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Award, Bell, Building2, CalendarDays, CheckCircle2, ChevronRight, CircleUserRound, Clock3, CreditCard, Home, MapPin, MessageSquare, PackageCheck, Search, ShieldCheck, Star, Trophy, Users, X } from "lucide-react";

type Match = {
  id: number;
  city: string;
  date: string;
  day: string;
  time: string;
  stadium: string;
  level: string;
  current: number;
  capacity: number;
  price: number;
  positions: string[];
  type: string;
};

const matches: Match[] = [
  { id: 1, city: "대전", date: "9월 20일", day: "토", time: "14:00–17:00", stadium: "한밭 베이스볼파크", level: "입문·초급", current: 16, capacity: 20, price: 25000, positions: ["투수", "유격수", "우익수"], type: "PLAY OFFICIAL" },
  { id: 2, city: "세종", date: "9월 21일", day: "일", time: "10:00–13:00", stadium: "세종 중앙야구장", level: "초급·중급", current: 18, capacity: 20, price: 28000, positions: ["포수", "2루수"], type: "HOST MATCH" },
  { id: 3, city: "대전", date: "9월 27일", day: "토", time: "18:00–21:00", stadium: "대덕 드림구장", level: "중급", current: 12, capacity: 20, price: 27000, positions: ["투수", "포수", "중견수"], type: "VENUE MATCH" },
  { id: 4, city: "청주", date: "9월 28일", day: "일", time: "15:00–18:00", stadium: "청주 생활야구장", level: "입문·초급", current: 9, capacity: 20, price: 24000, positions: ["전 포지션"], type: "PLAY OFFICIAL" },
];

const fieldPositions = ["투수", "포수", "1루수", "2루수", "3루수", "유격수", "좌익수", "중견수", "우익수"];
const regions = ["전체", "대전", "세종", "청주"];
type Tab = "home" | "search" | "catchball" | "gear" | "my";
type Application = { match: Match; positions: string[]; status: "승인 완료" | "승인 대기" };
type Gear = { id:number; name:string; category:string; fit:string; price:number; stock:number; icon:string; badge:string };
type Rental = { gear:Gear; match:Match; status:"예약 완료" | "반납 완료" };
type Venue = { id:number; region:string; name:string; address:string; field:string; fee:number; slots:{ time:string; available:boolean }[] };
type CreatedRoom = { venue:Venue; date:string; time:string; capacity:number; paid:number };
type ReviewPlayer = { id:number; name:string; position:string; level:string; number:number; mvp?:boolean };
type CatchballGroup = { id:number; city:string; title:string; place:string; time:string; level:string; people:string; host:{ name:string; experience:string; level:string; manner:number }; members:{ name:string; experience:string; level:string }[] };

const catchballGroups: CatchballGroup[] = [
  { id: 1, city: "대전", title: "퇴근 후 가볍게 캐치볼", place: "유림공원 잔디광장", time: "오늘 19:30", level: "초보자 환영", people: "2/4명", host:{ name:"김민준", experience:"캐치볼 18회", level:"초급자", manner:99 }, members:[{ name:"서지훈", experience:"캐치볼 7회", level:"초급자" }] },
  { id: 2, city: "세종", title: "주말 오전 수비 연습", place: "금강스포츠공원", time: "토요일 09:00", level: "초급·중급", people: "3/6명", host:{ name:"박정우", experience:"캐치볼 34회", level:"중급자", manner:98 }, members:[{ name:"이민석", experience:"캐치볼 12회", level:"초급자" },{ name:"한지훈", experience:"캐치볼 27회", level:"중급자" }] },
  { id: 3, city: "청주", title: "투수·포수 배터리 연습", place: "무심천 체육공원", time: "일요일 16:00", level: "중급자", people: "2/4명", host:{ name:"최도윤", experience:"캐치볼 41회", level:"중급자", manner:96 }, members:[{ name:"윤현수", experience:"캐치볼 22회", level:"중급자" }] },
];
const gearCatalog: Gear[] = [
  { id:1, name:"내야수 글러브", category:"글러브", fit:"우투 · 11.75인치", price:10000, stock:4, icon:"🥎", badge:"포지션 추천" },
  { id:2, name:"외야수 글러브", category:"글러브", fit:"우투 · 12.75인치", price:10000, stock:3, icon:"⚾", badge:"인기" },
  { id:3, name:"알루미늄 배트", category:"배트", fit:"33인치 · 900g", price:10000, stock:5, icon:"🏏", badge:"공인 규격" },
  { id:4, name:"타자 헬멧", category:"보호장비", fit:"양귀 · M/L", price:10000, stock:8, icon:"🪖", badge:"안전 점검" },
  { id:5, name:"포수 보호 세트", category:"보호장비", fit:"마스크·프로텍터·렉가드", price:10000, stock:2, icon:"🛡️", badge:"세트 대여" },
  { id:6, name:"입문자 스타터 세트", category:"세트", fit:"글러브·배트·헬멧", price:10000, stock:3, icon:"🎒", badge:"첫 경기 추천" },
];

const venues: Venue[] = [
  { id:1, region:"대전", name:"한밭 베이스볼파크", address:"대전 유성구 용계동", field:"인조잔디 · 조명", fee:120000, slots:[{time:"09:00–12:00",available:false},{time:"13:00–16:00",available:true},{time:"17:00–20:00",available:true}] },
  { id:2, region:"대전", name:"대덕 드림구장", address:"대전 대덕구 문평동", field:"인조잔디 · 덕아웃", fee:150000, slots:[{time:"08:00–11:00",available:true},{time:"12:00–15:00",available:false},{time:"16:00–19:00",available:true}] },
  { id:3, region:"세종", name:"세종 중앙야구장", address:"세종 연기면 세종리", field:"천연잔디 · 주차장", fee:140000, slots:[{time:"09:00–12:00",available:true},{time:"13:00–16:00",available:true},{time:"17:00–20:00",available:false}] },
  { id:4, region:"청주", name:"청주 생활야구장", address:"청주 흥덕구 문암동", field:"인조잔디 · 조명", fee:110000, slots:[{time:"08:00–11:00",available:false},{time:"12:00–15:00",available:true},{time:"16:00–19:00",available:true}] },
];

const completedGame = {
  date:"9월 14일 (일)", time:"14:00–17:00", venue:"한밭 베이스볼파크", home:"PLAY BLUE", away:"PLAY WHITE", homeScore:8, awayScore:6,
  mvp:{ name:"박정우", position:"투수", summary:"6이닝 8K · 2타점" },
  players:[
    { id:1, name:"박정우", position:"투수", level:"레벨 5", number:18, mvp:true },
    { id:2, name:"이민석", position:"포수", level:"레벨 4", number:22 },
    { id:3, name:"최도윤", position:"3루수", level:"레벨 3", number:7 },
    { id:4, name:"한지훈", position:"중견수", level:"레벨 4", number:51 },
  ] satisfies ReviewPlayer[],
};

const positiveReviewTags = ["매너 플레이", "팀원을 배려해요", "시간 약속을 지켜요", "안전하게 플레이해요"];
const cautionReviewTags = ["거친 플레이", "욕설·폭언", "과도한 항의", "안전 수칙 미준수"];

export function PlayBaseballApp() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [region, setRegion] = useState("전체");
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [positions, setPositions] = useState<string[]>([]);
  const [preferredPositions, setPreferredPositions] = useState(["유격수", "2루수", "중견수"]);
  const [applications, setApplications] = useState<Application[]>([
    { match: matches[0], positions: ["유격수", "2루수"], status: "승인 완료" },
    { match: matches[1], positions: ["포수", "2루수"], status: "승인 대기" },
  ]);
  const [toast, setToast] = useState("");
  const [demoRunning, setDemoRunning] = useState(false);
  const [showDemoIntro, setShowDemoIntro] = useState(false);
  const [demoIntroReady, setDemoIntroReady] = useState(false);
  const [demoPresentation, setDemoPresentation] = useState(true);
  const [demoCursor, setDemoCursor] = useState({ visible: false, x: 215, y: 466, clicking: false });
  const [selectedGear, setSelectedGear] = useState<Gear | null>(null);
  const [gearCategory, setGearCategory] = useState("전체");
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [addGearToMatch, setAddGearToMatch] = useState(false);
  const [matchGearIds, setMatchGearIds] = useState<number[]>([]);
  const [roomBuilderOpen, setRoomBuilderOpen] = useState(false);
  const [roomStep, setRoomStep] = useState(1);
  const [roomRegion, setRoomRegion] = useState("대전");
  const [selectedVenueId, setSelectedVenueId] = useState<number | null>(null);
  const [selectedRoomTime, setSelectedRoomTime] = useState("");
  const [createdRoom, setCreatedRoom] = useState<CreatedRoom | null>(null);
  const [resultOpen, setResultOpen] = useState(false);
  const [reviewPlayerId, setReviewPlayerId] = useState<number | null>(null);
  const [reviewTags, setReviewTags] = useState<string[]>([]);
  const [reviewedPlayerIds, setReviewedPlayerIds] = useState<number[]>([]);
  const [showMyMannerReport, setShowMyMannerReport] = useState(false);
  const [catchballBuilderOpen, setCatchballBuilderOpen] = useState(false);
  const [catchballStep, setCatchballStep] = useState(1);
  const [catchballPlace, setCatchballPlace] = useState("");
  const [catchballTime, setCatchballTime] = useState("");
  const [catchballLevel, setCatchballLevel] = useState("초보자 환영");
  const [createdCatchballRoom, setCreatedCatchballRoom] = useState(false);
  const [selectedCatchballGroup, setSelectedCatchballGroup] = useState<CatchballGroup | null>(null);
  const [joinedCatchballId, setJoinedCatchballId] = useState<number | null>(null);

  const filteredMatches = useMemo(
    () => region === "전체" ? matches : matches.filter((match) => match.city === region),
    [region],
  );
  const roomVenues = useMemo(() => venues.filter((venue) => venue.region === roomRegion), [roomRegion]);
  const selectedRoomVenue = venues.find((venue) => venue.id === selectedVenueId) ?? null;

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function togglePosition(position: string) {
    setPositions((current) => {
      if (current.includes(position)) return current.filter((item) => item !== position);
      if (current.length >= 3) return current;
      return [...current, position];
    });
  }

  function openMatch(match: Match) {
    setSelectedMatch(match);
    setPositions([]);
    setAddGearToMatch(false);
    setMatchGearIds([]);
  }

  function apply() {
    if (!selectedMatch || positions.length === 0) return;
    setPreferredPositions(positions);
    setApplications((current) => [
      { match: selectedMatch, positions, status: "승인 대기" },
      ...current.filter((item) => item.match.id !== selectedMatch.id),
    ]);
    if (addGearToMatch && matchGearIds.length) {
      const reserved = gearCatalog.filter((gear) => matchGearIds.includes(gear.id));
      setRentals((current) => [
        ...reserved.map((gear) => ({ gear, match:selectedMatch, status:"예약 완료" as const })),
        ...current.filter((item) => !matchGearIds.includes(item.gear.id)),
      ]);
    }
    setSelectedMatch(null);
    setToast(matchGearIds.length ? `${selectedMatch.date} 경기와 장비 ${matchGearIds.length}개 예약이 접수됐어요.` : `${selectedMatch.date} 경기 신청이 접수됐어요.`);
  }

  async function openDemoIntro() {
    setDemoPresentation(true);
    setDemoIntroReady(false);
    setShowDemoIntro(true);
    window.scrollTo({ top: 0, behavior: "auto" });
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
    } catch {}
    window.setTimeout(() => setDemoIntroReady(true), 650);
  }

  async function runRecordingDemo() {
    if (demoRunning) return;
    setShowDemoIntro(false);
    setDemoPresentation(true);
    setDemoRunning(true);
    const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));
    const moveAndClick = async (selector: string, action: () => void, scroll = false) => {
      const target = document.querySelector<HTMLElement>(selector);
      if (!target) return;
      if (scroll) {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
        await wait(900);
      }
      const rect = target.getBoundingClientRect();
      setDemoCursor({ visible: true, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, clicking: false });
      await wait(900);
      setDemoCursor((current) => ({ ...current, clicking: true }));
      await wait(230);
      action();
      setDemoCursor((current) => ({ ...current, clicking: false }));
      await wait(850);
    };
    setActiveTab("home");
    setSelectedMatch(null);
    setPositions([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
    await wait(1600);
    await moveAndClick('[data-demo="match-join"]', () => openMatch(matches[0]), true);
    await moveAndClick('[data-demo="position-shortstop"]', () => togglePosition("유격수"), true);
    await moveAndClick('[data-demo="position-second"]', () => togglePosition("2루수"));
    await moveAndClick('[data-demo="gear-toggle"]', () => setAddGearToMatch(true), true);
    await wait(500);
    await moveAndClick('[data-demo="gear-first"]', () => setMatchGearIds([gearCatalog[0].id]), true);
    await moveAndClick('[data-demo="apply-match"]', () => {
      const demoPositions = ["유격수", "2루수"];
      setPreferredPositions(demoPositions);
      setApplications((current) => [
        { match: matches[0], positions: demoPositions, status: "승인 대기" },
        ...current.filter((item) => item.match.id !== matches[0].id),
      ]);
      setRentals((current) => [
        { gear: gearCatalog[0], match: matches[0], status: "예약 완료" },
        ...current.filter((item) => item.gear.id !== gearCatalog[0].id),
      ]);
      setSelectedMatch(null);
      setToast("9월 20일 경기와 장비 예약이 접수됐어요.");
    }, true);
    await moveAndClick('[data-demo="nav-my"]', () => setActiveTab("my"));
    await wait(700);
    const applicationsSection = document.querySelector<HTMLElement>('[data-demo="applications"]');
    applicationsSection?.scrollIntoView({ behavior: "smooth", block: "start" });
    await wait(2200);
    const profileSection = document.querySelector<HTMLElement>('[data-demo="my-profile"]');
    profileSection?.scrollIntoView({ behavior: "smooth", block: "start" });
    await wait(2400);
    setDemoCursor((current) => ({ ...current, visible: false }));
    setDemoRunning(false);
  }

  async function runRoomCreationDemo() {
    if (demoRunning) return;
    setShowDemoIntro(false);
    setDemoPresentation(true);
    setDemoRunning(true);
    setCreatedRoom(null);
    setRoomBuilderOpen(false);
    const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));
    const moveAndClick = async (selector: string, action: () => void, scroll = false) => {
      const target = document.querySelector<HTMLElement>(selector);
      if (!target) return;
      if (scroll) {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
        await wait(700);
      }
      const rect = target.getBoundingClientRect();
      setDemoCursor({ visible: true, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, clicking: false });
      await wait(780);
      setDemoCursor((current) => ({ ...current, clicking: true }));
      await wait(220);
      action();
      setDemoCursor((current) => ({ ...current, clicking: false }));
      await wait(720);
    };

    setActiveTab("home");
    window.scrollTo({ top: 0, behavior: "auto" });
    await wait(900);
    await moveAndClick('[data-demo="nav-search"]', () => setActiveTab("search"));
    await wait(500);
    await moveAndClick('[data-demo="room-open"]', openRoomBuilder, true);
    await moveAndClick('[data-demo="room-region-daejeon"]', () => setRoomRegion("대전"));
    await moveAndClick('[data-demo="room-region-next"]', () => setRoomStep(2));
    await moveAndClick('[data-demo="room-venue-first"]', () => setSelectedVenueId(1));
    await moveAndClick('[data-demo="room-venue-next"]', () => setRoomStep(3));
    await moveAndClick('[data-demo="room-slot-first"]', () => setSelectedRoomTime("13:00–16:00"));
    await moveAndClick('[data-demo="room-slot-next"]', () => setRoomStep(4));
    await moveAndClick('[data-demo="room-pay"]', () => {
      setCreatedRoom({ venue:venues[0], date:"9월 27일 (토)", time:"13:00–16:00", capacity:20, paid:venues[0].fee });
      setRoomStep(5);
      setToast("구장 결제가 완료되어 모집방이 열렸어요.");
    }, true);
    await moveAndClick('[data-demo="room-finish"]', () => setRoomBuilderOpen(false), true);
    await moveAndClick('[data-demo="nav-home"]', () => setActiveTab("home"));
    await wait(500);
    const homeCreatedRoom = document.querySelector<HTMLElement>('[data-demo="home-created-room"]');
    homeCreatedRoom?.scrollIntoView({ behavior: "smooth", block: "center" });
    await wait(2600);
    setDemoCursor((current) => ({ ...current, visible: false }));
    setDemoRunning(false);
  }

  async function runPostGameReviewDemo() {
    if (demoRunning) return;
    setShowDemoIntro(false);
    setDemoPresentation(true);
    setDemoRunning(true);
    setResultOpen(false);
    setReviewPlayerId(null);
    setReviewTags([]);
    setReviewedPlayerIds([]);
    setShowMyMannerReport(false);
    const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));
    const moveAndClick = async (selector: string, action: () => void, scroll = false) => {
      const target = document.querySelector<HTMLElement>(selector);
      if (!target) return;
      if (scroll) {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
        await wait(750);
      }
      const rect = target.getBoundingClientRect();
      setDemoCursor({ visible: true, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, clicking: false });
      await wait(820);
      setDemoCursor((current) => ({ ...current, clicking: true }));
      await wait(220);
      action();
      setDemoCursor((current) => ({ ...current, clicking: false }));
      await wait(760);
    };

    setActiveTab("home");
    window.scrollTo({ top: 0, behavior: "auto" });
    await wait(900);
    await moveAndClick('[data-demo="nav-my"]', () => setActiveTab("my"));
    await wait(500);
    await moveAndClick('[data-demo="completed-game"]', () => setResultOpen(true), true);
    await moveAndClick('[data-demo="review-player-3"]', () => { setReviewPlayerId(3); setReviewTags([]); }, true);
    await moveAndClick('[data-demo="review-caution-rough"]', () => setReviewTags(["거친 플레이"]), true);
    await moveAndClick('[data-demo="review-submit"]', () => {
      setReviewedPlayerIds([3]);
      setReviewPlayerId(null);
      setReviewTags([]);
      setToast("최도윤님의 비공개 매너 리뷰를 저장했어요.");
    }, true);
    await moveAndClick('[data-demo="open-my-review"]', () => setShowMyMannerReport(true), true);
    await wait(350);
    document.querySelector<HTMLElement>('[data-demo="my-manner-report"]')?.scrollIntoView({ behavior: "smooth", block: "center" });
    await wait(2600);
    setDemoCursor((current) => ({ ...current, visible: false }));
    setDemoRunning(false);
  }

  async function runCatchballDemo() {
    if (demoRunning) return;
    setShowDemoIntro(false);
    setDemoPresentation(true);
    setDemoRunning(true);
    setCatchballBuilderOpen(false);
    setCatchballStep(1);
    setCatchballPlace("");
    setCatchballTime("");
    setCatchballLevel("초보자 환영");
    setCreatedCatchballRoom(false);
    setSelectedCatchballGroup(null);
    setJoinedCatchballId(null);
    const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));
    const moveAndClick = async (selector: string, action: () => void, scroll = false) => {
      const target = document.querySelector<HTMLElement>(selector);
      if (!target) return;
      if (scroll) {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
        await wait(650);
      }
      const rect = target.getBoundingClientRect();
      setDemoCursor({ visible: true, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, clicking: false });
      await wait(700);
      setDemoCursor((current) => ({ ...current, clicking: true }));
      await wait(220);
      action();
      setDemoCursor((current) => ({ ...current, clicking: false }));
      await wait(700);
    };

    setActiveTab("home");
    window.scrollTo({ top: 0, behavior: "auto" });
    await wait(700);
    await moveAndClick('[data-demo="nav-catchball"]', () => setActiveTab("catchball"));
    await moveAndClick('[data-demo="catchball-create-open"]', () => { setCatchballBuilderOpen(true); setCatchballStep(1); }, true);
    await moveAndClick('[data-demo="catchball-place-first"]', () => setCatchballPlace("갑천 체육공원"));
    await moveAndClick('[data-demo="catchball-builder-next"]', () => setCatchballStep(2));
    await moveAndClick('[data-demo="catchball-time-first"]', () => setCatchballTime("오늘 20:00"));
    await moveAndClick('[data-demo="catchball-level-beginner"]', () => setCatchballLevel("초보자 환영"));
    await moveAndClick('[data-demo="catchball-create-confirm"]', () => { setCreatedCatchballRoom(true); setCatchballStep(3); setToast("캐치볼 약속방을 만들었어요."); }, true);
    await moveAndClick('[data-demo="catchball-create-finish"]', () => setCatchballBuilderOpen(false));
    await wait(500);
    document.querySelector<HTMLElement>('[data-demo="created-catchball-room"]')?.scrollIntoView({ behavior: "smooth", block: "center" });
    await wait(1600);
    await moveAndClick('[data-demo="catchball-group-2"]', () => setSelectedCatchballGroup(catchballGroups[1]), true);
    await moveAndClick('[data-demo="catchball-join"]', () => { setJoinedCatchballId(2); setToast("박정우님과 캐치볼 약속이 확정됐어요."); }, true);
    await wait(500);
    document.querySelector<HTMLElement>('[data-demo="catchball-appointment"]')?.scrollIntoView({ behavior: "smooth", block: "center" });
    await wait(2800);
    setDemoCursor((current) => ({ ...current, visible: false }));
    setDemoRunning(false);
  }

  function reserveGear() {
    if (!selectedGear) return;
    setRentals((current) => [{ gear:selectedGear, match:matches[0], status:"예약 완료" }, ...current.filter((item) => item.gear.id !== selectedGear.id)]);
    setSelectedGear(null);
    setToast("장비 예약이 완료됐어요. 경기 30분 전 운영 부스에서 받아보세요.");
  }

  function openRoomBuilder() {
    setRoomStep(1);
    setRoomRegion("대전");
    setSelectedVenueId(null);
    setSelectedRoomTime("");
    setRoomBuilderOpen(true);
  }

  function openGameResult() {
    setReviewPlayerId(null);
    setReviewTags([]);
    setShowMyMannerReport(false);
    setResultOpen(true);
  }

  function toggleReviewTag(tag:string) {
    setReviewTags((current) => current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]);
  }

  function submitPlayerReview() {
    if (!reviewPlayerId || reviewTags.length === 0) return;
    const player = completedGame.players.find((item) => item.id === reviewPlayerId);
    setReviewedPlayerIds((current) => current.includes(reviewPlayerId) ? current : [...current, reviewPlayerId]);
    setReviewPlayerId(null);
    setReviewTags([]);
    setToast(`${player?.name ?? "참가자"}님의 비공개 매너 리뷰를 저장했어요.`);
  }

  function confirmRoomCreation() {
    if (!selectedRoomVenue || !selectedRoomTime) return;
    setCreatedRoom({ venue:selectedRoomVenue, date:"9월 27일 (토)", time:selectedRoomTime, capacity:20, paid:selectedRoomVenue.fee });
    setRoomStep(5);
    setToast("구장 결제가 완료되어 모집방이 열렸어요.");
  }

  return (
    <div className={`app-shell ${demoPresentation ? "demo-presentation" : ""}`}>
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand display"><span className="brand-mark"><Trophy size={20} aria-hidden="true" /></span>PLAY BASEBALL</div>
          <div className="topbar-actions"><button className="recording-button" onClick={openDemoIntro} disabled={demoRunning}>{demoRunning ? "시연 중…" : "시연하기"}</button><button className="avatar" aria-label="알림 확인"><Bell size={19} aria-hidden="true" /></button></div>
        </div>
      </header>

      <main className="content">
        {activeTab === "home" ? <>
        <section className="hero" aria-labelledby="hero-title">
          <div>
            <span className="eyebrow"><ShieldCheck size={16} aria-hidden="true" /> 생활야구 소셜매치</span>
            <h1 id="hero-title" className="display">팀을 찾지 마세요.<br />경기만 고르세요.</h1>
            <p>원하는 날짜와 지역을 고르고, 희망 포지션 1~3지망으로 이번 주말 야구를 시작하세요.</p>
          </div>
          <div className="hero-stat" aria-label="이번 주 경기 현황">
            <div className="stat"><span>이번 주 경기</span><strong className="display">12</strong></div>
            <div className="stat"><span>모집 중 자리</span><strong className="display">36</strong></div>
          </div>
        </section>

        <section className="my-profile-summary" aria-label="나의 야구 프로필">
          <div className="profile-title">
            <span className="profile-icon"><CircleUserRound size={22} aria-hidden="true" /></span>
            <div><span>MY PLAY PROFILE</span><strong>나의 야구 프로필</strong></div>
          </div>
          <div className="profile-divider" aria-hidden="true" />
          <div className="profile-item">
            <span>나의 등급</span>
            <strong><Trophy size={17} aria-hidden="true" /> PLAY LEVEL 3 <em>루키+</em></strong>
          </div>
          <div className="profile-item positions-summary">
            <span>선호 포지션</span>
            <div>{preferredPositions.map((position, index) => <b key={position}>{index + 1}지망 · {position}</b>)}</div>
          </div>
        </section>

        {createdRoom ? <section className="home-created-room" data-demo="home-created-room" aria-label="내가 만든 모집방">
          <div className="home-room-live"><span>LIVE</span><strong>모집 중</strong></div>
          <div className="home-room-main"><span className="badge green">내가 만든 방</span><h2>{createdRoom.date} 경기</h2><p><MapPin size={15}/>{createdRoom.venue.name}</p><p><Clock3 size={15}/>{createdRoom.time}</p></div>
          <div className="home-room-count"><span>현재 인원</span><strong>0<small>/{createdRoom.capacity}명</small></strong></div>
          <button className="secondary-button" onClick={()=>setActiveTab("search")}>모집방 관리</button>
        </section> : null}

        <nav className="filters" aria-label="지역 필터">
          {regions.map((item) => (
            <button key={item} className={`chip ${region === item ? "active" : ""}`} onClick={() => setRegion(item)} aria-pressed={region === item}>
              {item}
            </button>
          ))}
          <button className="chip"><CalendarDays size={16} aria-hidden="true" /> 날짜 선택</button>
          <button className="chip"><Search size={16} aria-hidden="true" /> 조건 검색</button>
        </nav>

        <div className="section-head">
          <div><h2 className="display">참가 가능한 경기</h2><p>{region === "전체" ? "내 주변" : region}에서 지금 신청할 수 있어요.</p></div>
        </div>

        <section className="match-grid" aria-live="polite">
          {filteredMatches.map((match) => (
            <article className="match-card" key={match.id}>
              <div className="card-accent" />
              <div className="card-body">
                <div className="badge-row">
                  <span className="badge">{match.city}</span>
                  <span className="badge green">{match.level}</span>
                  {match.capacity - match.current <= 3 ? <span className="badge orange">마감 임박</span> : null}
                </div>
                <h3>{match.date} ({match.day}) 경기</h3>
                <div className="meta">
                  <div className="meta-row"><Clock3 size={17} aria-hidden="true" />{match.time}</div>
                  <div className="meta-row"><MapPin size={17} aria-hidden="true" />{match.stadium}</div>
                </div>
                <div className="positions" aria-label="현재 필요한 포지션">
                  {match.positions.map((position) => <span key={position} className="position-pill">{position}</span>)}
                </div>
                <div className="card-footer">
                  <div><div className="price">{match.price.toLocaleString()}원</div><div className="capacity">{match.current}/{match.capacity}명 참가</div></div>
                  <button className="primary-button" data-demo={match.id === 1 ? "match-join" : undefined} onClick={() => openMatch(match)}>참가하기 <ChevronRight size={16} aria-hidden="true" /></button>
                </div>
              </div>
            </article>
          ))}
          {filteredMatches.length === 0 ? <div className="empty">현재 이 지역에 모집 중인 경기가 없습니다.</div> : null}
        </section>
        </> : null}

        {activeTab === "search" ? <section className="page-screen" aria-labelledby="search-title">
          <div className="page-hero compact">
            <span className="eyebrow"><Search size={16} aria-hidden="true" /> MATCH FINDER</span>
            <h1 id="search-title" className="display">내 일정에 맞는 경기를 찾아보세요.</h1>
            <p>충청권 생활야구 경기를 지역, 날짜, 실력으로 빠르게 찾을 수 있어요.</p>
          </div>
          <section className="room-maker-banner" aria-label="새 경기방 만들기">
            <div className="room-maker-mark"><Building2 size={28}/></div>
            <div><strong>원하는 경기가 없다면 직접 열어보세요.</strong><p>지역과 빈 구장 시간을 고르고 결제하면 바로 참가자를 모집할 수 있어요.</p></div>
            <button className="primary-button" data-demo="room-open" onClick={openRoomBuilder}>방 만들기 <ChevronRight size={17}/></button>
          </section>
          {createdRoom ? <article className="created-room-card" aria-label="내가 만든 모집방">
            <div className="created-room-status"><span>모집 중</span><strong>0/{createdRoom.capacity}명</strong></div>
            <div><span className="badge">내가 만든 방</span><h3>{createdRoom.date} 경기</h3><p><MapPin size={15}/>{createdRoom.venue.name}</p><p><Clock3 size={15}/>{createdRoom.time}</p></div>
            <button className="secondary-button" onClick={openRoomBuilder}>방 정보 보기</button>
          </article> : null}
          <div className="search-panel">
            <label><span>지역</span><select value={region} onChange={(event) => setRegion(event.target.value)}>{regions.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label><span>날짜</span><select defaultValue="이번 달"><option>이번 주</option><option>이번 달</option><option>날짜 직접 선택</option></select></label>
            <label><span>경기 수준</span><select defaultValue="전체 수준"><option>전체 수준</option><option>입문·초급</option><option>중급</option></select></label>
            <button className="primary-button"><Search size={17} aria-hidden="true" /> {filteredMatches.length}개 경기 보기</button>
          </div>
          <div className="section-head"><div><h2 className="display">검색 결과</h2><p>{region === "전체" ? "충청권" : region}에서 참가 가능한 경기예요.</p></div><span className="result-count">{filteredMatches.length} MATCHES</span></div>
          <section className="match-grid">{filteredMatches.map((match) => <article className="match-card" key={`search-${match.id}`}><div className="card-accent"/><div className="card-body"><div className="badge-row"><span className="badge">{match.city}</span><span className="badge green">{match.level}</span></div><h3>{match.date} ({match.day}) 경기</h3><div className="meta"><div className="meta-row"><Clock3 size={17}/>{match.time}</div><div className="meta-row"><MapPin size={17}/>{match.stadium}</div></div><div className="positions">{match.positions.map((position) => <span className="position-pill" key={position}>{position}</span>)}</div><div className="card-footer"><div><div className="price">{match.price.toLocaleString()}원</div><div className="capacity">{match.current}/{match.capacity}명 참가</div></div><button className="primary-button" onClick={() => openMatch(match)}>상세 보기 <ChevronRight size={16}/></button></div></div></article>)}</section>
        </section> : null}

        {activeTab === "catchball" ? <section className="page-screen" aria-labelledby="catchball-title">
          <div className="page-hero catchball-hero"><div><span className="eyebrow"><Users size={16}/> CATCH BALL</span><h1 id="catchball-title" className="display">경기 전, 가볍게 같이 던져요.</h1><p>가까운 동네 야구인과 부담 없이 만나 캐치볼하고 연습해요.</p></div><div className="ball-graphic" aria-hidden="true">⚾</div></div>
          <div className="catchball-actions"><div><span>원하는 약속이 없나요?</span><strong>장소와 시간을 정해 직접 모집해 보세요.</strong></div><button className="primary-button" data-demo="catchball-create-open" onClick={()=>{setCatchballBuilderOpen(true);setCatchballStep(1)}}>+ 캐치볼 방 만들기</button></div>
          {createdCatchballRoom ? <article className="created-catchball-card" data-demo="created-catchball-room"><div className="created-catchball-label"><CheckCircle2 size={18}/><span>내가 만든 방 · 모집 중</span></div><div><h3>저녁에 천천히 캐치볼해요</h3><p><Clock3 size={15}/>오늘 20:00 <i/> <MapPin size={15}/>갑천 체육공원</p></div><div className="catchball-person host"><span className="person-avatar">나</span><div><small>방장 · 김플레이어</small><strong>캐치볼 12회 · 초급자</strong></div><span className="badge green">초보자 환영</span></div><div className="created-catchball-status"><Users size={17}/><strong>1/4명</strong><span>참가자를 기다리고 있어요</span></div></article> : null}
          <div className="section-head"><div><h2 className="display">가까운 캐치볼 모임</h2><p>시간과 장소, 참여자의 경험을 확인하고 약속을 잡으세요.</p></div><span className="result-count">{catchballGroups.length} ROOMS</span></div>
          <div className="catchball-grid">{catchballGroups.map((group) => <article className="catchball-card" key={group.id}><div className="catchball-top"><span className="badge">{group.city}</span><span className="open-dot">모집 중</span></div><h3>{group.title}</h3><div className="meta"><div className="meta-row"><Clock3 size={17}/>{group.time}</div><div className="meta-row"><MapPin size={17}/>{group.place}</div></div><div className="catchball-person"><span className="person-avatar">{group.host.name.slice(0,1)}</span><div><small>방장 · {group.host.name}</small><strong>{group.host.experience} · {group.host.level}</strong></div><span className="manner-mini">매너 {group.host.manner}</span></div><div className="catchball-footer"><div><span className="badge green">{group.level}</span><span><Users size={15}/>{group.people}</span></div><button className="primary-button" data-demo={group.id===2?"catchball-group-2":undefined} onClick={()=>setSelectedCatchballGroup(group)}>상세·참가</button></div></article>)}</div>
          <div className="safety-note"><ShieldCheck size={24}/><div><strong>안전한 만남을 위한 PLAY 약속</strong><p>공공장소에서 만나고, 일정 변경은 참여자 채팅으로 미리 알려주세요.</p></div></div>
        </section> : null}

        {activeTab === "gear" ? <section className="page-screen" aria-labelledby="gear-title">
          <div className="page-hero gear-hero"><div><span className="eyebrow"><PackageCheck size={16}/> PLAY GEAR</span><h1 id="gear-title" className="display">몸만 와도, 바로 플레이.</h1><p>신청한 경기와 포지션에 맞는 장비를 예약하고 경기장에서 수령하세요.</p></div><div className="gear-hero-mark" aria-hidden="true">⚾</div></div>
          <div className="gear-benefits"><div><strong>01</strong><span>경기 연동 예약</span><p>신청 경기와 자동 연결</p></div><div><strong>02</strong><span>현장 수령·반납</span><p>무거운 장비 배송 없이</p></div><div><strong>03</strong><span>점검 완료 장비</span><p>세척·안전 점검 이력 관리</p></div></div>
          <div className="section-head"><div><h2 className="display">대여 가능한 장비</h2><p>유격수 포지션을 기준으로 추천했어요.</p></div><div className="gear-filters">{["전체","글러브","배트","보호장비","세트"].map((category)=><button key={category} className={`chip ${gearCategory===category?"active":""}`} onClick={()=>setGearCategory(category)}>{category}</button>)}</div></div>
          <div className="gear-grid">{gearCatalog.filter((gear)=>gearCategory==="전체"||gear.category===gearCategory).map((gear)=><article className="gear-card" key={gear.id}><div className="gear-visual" aria-hidden="true">{gear.icon}</div><div className="gear-info"><div className="badge-row"><span className="badge">{gear.category}</span><span className="badge green">{gear.badge}</span></div><h3>{gear.name}</h3><p>{gear.fit}</p><div className="gear-stock"><span className="open-dot">대여 가능 {gear.stock}개</span><strong>{gear.price.toLocaleString()}원<small>/경기</small></strong></div><button className="primary-button" onClick={()=>setSelectedGear(gear)}>경기와 함께 예약</button></div></article>)}</div>
          <div className="gear-trust"><ShieldCheck size={26}/><div><strong>PLAY GEAR 컨디션 보증</strong><p>모든 장비는 반납 후 상태 확인, 세척, 안전 점검을 거쳐 다시 대여됩니다.</p></div></div>
        </section> : null}

        {activeTab === "my" ? <section className="page-screen" aria-labelledby="my-title">
          <div className="my-header" data-demo="my-profile"><div className="my-avatar"><CircleUserRound size={35}/></div><div><span>MY PLAY PROFILE</span><h1 id="my-title" className="display">김플레이어님</h1><p>이번 주에도 즐거운 야구를 준비하고 있어요.</p></div><button className="secondary-button" onClick={() => setToast("프로필 수정 화면은 데모에서 준비 중입니다.")}>프로필 수정</button></div>
          <div className="my-dashboard">
            <article className="level-card"><span>나의 등급</span><div><Trophy size={27}/><strong>PLAY LEVEL 3</strong><em>루키+</em></div><div className="progress"><i/></div><p>다음 레벨까지 경기 2회가 남았어요.</p></article>
            <article className="manner-card"><span>매너 점수</span><strong>98<span>점</span></strong><p><ShieldCheck size={16}/> 함께 뛰고 싶은 플레이어</p></article>
            <article className="record-card"><span>플레이 기록</span><div><strong>12<small>경기</small></strong><strong>8<small>이번 시즌</small></strong><strong>3<small>지역</small></strong></div></article>
          </div>
          <section className="my-section"><div className="section-head"><div><h2 className="display">선호 포지션</h2><p>경기 신청에서 선택한 포지션이 자동 반영돼요.</p></div></div><div className="preferred-list">{preferredPositions.map((position,index) => <div key={position}><span>{index+1}지망</span><strong>{position}</strong></div>)}</div></section>
          <section className="my-section"><div className="section-head"><div><h2 className="display">다가오는 경기</h2><p>신청이 확정된 다음 일정입니다.</p></div></div><article className="upcoming-card"><div className="calendar-box"><strong>20</strong><span>SEP</span></div><div><span className="badge">대전</span><h3>9월 20일 (토) 경기</h3><p><Clock3 size={15}/>14:00–17:00 · 한밭 베이스볼파크</p></div><button className="secondary-button" onClick={() => setActiveTab("search")}>경기 보기</button></article></section>
          <section className="my-section completed-section"><div className="section-head"><div><h2 className="display">종료된 경기</h2><p>결과와 MVP를 확인하고 함께 뛴 참가자를 리뷰하세요.</p></div><span className="result-count">REVIEW OPEN</span></div><article className="completed-game-card" data-demo="completed-game"><div className="completed-date"><strong>14</strong><span>SEP · SUN</span></div><div className="completed-main"><div><span className="badge green">경기 종료</span><h3>{completedGame.date} 경기</h3><p><MapPin size={15}/>{completedGame.venue}</p></div><div className="mini-score"><span>{completedGame.home}</span><strong>{completedGame.homeScore}<i>:</i>{completedGame.awayScore}</strong><span>{completedGame.away}</span></div><div className="mini-mvp"><Award size={20}/><span><small>GAME MVP</small><strong>{completedGame.mvp.name}</strong></span></div></div><button className="primary-button" onClick={openGameResult}>결과·리뷰 보기</button></article></section>
          <section className="my-section application-section" data-demo="applications">
            <div className="section-head"><div><h2 className="display">경기 신청 현황</h2><p>신청한 경기의 승인 상태와 희망 포지션을 확인하세요.</p></div><span className="result-count">{applications.length} APPLICATIONS</span></div>
            <div className="application-list">{applications.map(({match, positions: appliedPositions, status}) => <article className="application-card" key={match.id}>
              <div className="application-date"><strong>{match.date.replace("9월 ","").replace("일","")}</strong><span>9월 · {match.day}</span></div>
              <div className="application-main"><div className="application-heading"><div><span className="badge">{match.city}</span><h3>{match.date} ({match.day}) 경기</h3></div><span className={`status-badge ${status === "승인 완료" ? "confirmed" : "pending"}`}>{status}</span></div><p><Clock3 size={15}/>{match.time}<i/> <MapPin size={15}/>{match.stadium}</p><div className="applied-positions"><span>신청 포지션</span>{appliedPositions.map((position,index)=><b key={position}>{index+1}지망 · {position}</b>)}</div></div>
              <button className="secondary-button" onClick={() => openMatch(match)}>신청 상세</button>
            </article>)}</div>
          </section>
          <section className="my-section"><div className="section-head"><div><h2 className="display">장비 대여 현황</h2><p>경기장에서 받을 장비와 반납 상태를 확인하세요.</p></div><button className="secondary-button" onClick={()=>setActiveTab("gear")}>장비 둘러보기</button></div>{rentals.length?<div className="rental-list">{rentals.map(({gear,match,status})=><article className="rental-card" key={gear.id}><div className="rental-icon">{gear.icon}</div><div><span className="badge">{match.city} · {match.date}</span><h3>{gear.name}</h3><p>{match.stadium} 운영 부스 · 경기 30분 전 수령</p></div><span className="status-badge confirmed">{status}</span></article>)}</div>:<div className="rental-empty"><PackageCheck size={28}/><div><strong>예약한 장비가 아직 없어요.</strong><p>경기에 필요한 장비를 현장에서 편하게 받아보세요.</p></div><button className="primary-button" onClick={()=>setActiveTab("gear")}>장비 대여하기</button></div>}</section>
        </section> : null}
      </main>

      <nav className="bottom-nav five" aria-label="주요 메뉴">
        <button className={`nav-item ${activeTab === "home" ? "active" : ""}`} data-demo="nav-home" onClick={() => setActiveTab("home")}><Home size={20} aria-hidden="true" />홈</button>
        <button className={`nav-item ${activeTab === "search" ? "active" : ""}`} data-demo="nav-search" onClick={() => setActiveTab("search")}><Search size={20} aria-hidden="true" />경기 찾기</button>
        <button className={`nav-item ${activeTab === "catchball" ? "active" : ""}`} data-demo="nav-catchball" onClick={() => setActiveTab("catchball")}><Users size={20} aria-hidden="true" />캐치볼</button>
        <button className={`nav-item ${activeTab === "gear" ? "active" : ""}`} onClick={() => setActiveTab("gear")}><PackageCheck size={20} aria-hidden="true" />장비</button>
        <button className={`nav-item ${activeTab === "my" ? "active" : ""}`} data-demo="nav-my" onClick={() => setActiveTab("my")}><CircleUserRound size={20} aria-hidden="true" />MY</button>
      </nav>

      {selectedMatch ? (
        <div className="overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedMatch(null); }}>
          <section className="sheet" role="dialog" aria-modal="true" aria-labelledby="match-title">
            <div className="sheet-head">
              <div><span className="badge">{selectedMatch.type}</span><h2 id="match-title">{selectedMatch.date} ({selectedMatch.day}) 경기</h2><p className="helper">{selectedMatch.stadium}</p></div>
              <button className="close-button" onClick={() => setSelectedMatch(null)} aria-label="경기 상세 닫기"><X size={21} aria-hidden="true" /></button>
            </div>
            <div className="detail-grid">
              <div className="detail-box"><span>경기 시간</span><strong>{selectedMatch.time}</strong></div>
              <div className="detail-box"><span>경기 수준</span><strong>{selectedMatch.level}</strong></div>
              <div className="detail-box"><span>참가 현황</span><strong>{selectedMatch.current}/{selectedMatch.capacity}명</strong></div>
              <div className="detail-box"><span>참가비</span><strong>{selectedMatch.price.toLocaleString()}원</strong></div>
            </div>
            <h3 className="selection-title">희망 포지션을 선택하세요</h3>
            <p className="helper">선호 순서대로 최대 3개까지 선택할 수 있어요. 실제 배정은 경기 확정 시 안내합니다.</p>
            <div className="position-grid">
              {fieldPositions.map((position) => (
                <button key={position} data-demo={position === "유격수" ? "position-shortstop" : position === "2루수" ? "position-second" : undefined} className={`position-button ${positions.includes(position) ? "selected" : ""}`} onClick={() => togglePosition(position)} aria-pressed={positions.includes(position)}>
                  {position}
                </button>
              ))}
            </div>
            <div className="rank-list" aria-live="polite">
              {positions.map((position, index) => <div className="rank-item" key={position}><span>{index + 1}지망</span><strong>{position}</strong></div>)}
            </div>
            <section className="match-gear-option" aria-labelledby="match-gear-title">
              <button className={`gear-toggle ${addGearToMatch ? "selected" : ""}`} data-demo="gear-toggle" onClick={() => { setAddGearToMatch((current) => !current); if (addGearToMatch) setMatchGearIds([]); }} aria-pressed={addGearToMatch}>
                <span className="gear-toggle-icon"><PackageCheck size={22}/></span>
                <span><strong id="match-gear-title">장비도 함께 대여할게요</strong><small>경기장에서 바로 수령하고 반납할 수 있어요.</small></span>
                <b>{addGearToMatch ? "선택됨" : "선택"}</b>
              </button>
              {addGearToMatch ? <div className="match-gear-picker">
                <div className="refund-policy"><ShieldCheck size={18}/><div><strong>장비 1개당 10,000원 선결제</strong><span>안전하게 반납하면 5,000원 환급 · 최종 이용료 5,000원</span></div></div>
                {gearCatalog.slice(0,5).map((gear) => <button key={gear.id} data-demo={gear.id === 1 ? "gear-first" : undefined} className={`match-gear-row ${matchGearIds.includes(gear.id) ? "selected" : ""}`} onClick={() => setMatchGearIds((current) => current.includes(gear.id) ? current.filter((id) => id !== gear.id) : [...current, gear.id])} aria-pressed={matchGearIds.includes(gear.id)}>
                  <span className="mini-gear-icon">{gear.icon}</span><span><strong>{gear.name}</strong><small>{gear.fit}</small></span><span className="gear-price"><b>10,000원</b><small>5천원 환급</small></span>
                </button>)}
                {matchGearIds.length ? <div className="gear-payment-summary"><span>장비 {matchGearIds.length}개 선결제</span><strong>{(matchGearIds.length * 10000).toLocaleString()}원</strong><small>정상 반납 시 {(matchGearIds.length * 5000).toLocaleString()}원 환급 예정</small></div> : null}
              </div> : null}
            </section>
            <button className="primary-button sheet-cta" data-demo="apply-match" onClick={apply} disabled={positions.length === 0}>희망 포지션으로 참가 신청</button>
          </section>
        </div>
      ) : null}

      {selectedGear ? <div className="overlay" role="presentation" onMouseDown={(event)=>{if(event.target===event.currentTarget)setSelectedGear(null)}}><section className="sheet gear-sheet" role="dialog" aria-modal="true" aria-labelledby="gear-rental-title"><div className="sheet-head"><div><span className="badge">PLAY GEAR RESERVATION</span><h2 id="gear-rental-title">{selectedGear.name}</h2><p className="helper">{selectedGear.fit}</p></div><button className="close-button" onClick={()=>setSelectedGear(null)} aria-label="장비 예약 닫기"><X size={21}/></button></div><div className="rental-summary"><div><span>연결 경기</span><strong>9월 20일 (토) · 대전</strong><small>한밭 베이스볼파크</small></div><div><span>수령·반납</span><strong>경기장 PLAY 운영 부스</strong><small>경기 30분 전 수령 · 종료 후 20분 이내 반납</small></div><div><span>대여료</span><strong>{selectedGear.price.toLocaleString()}원</strong><small>참가비 결제 시 함께 결제</small></div></div><label className="rental-check"><input type="checkbox" defaultChecked/> 장비 상태 확인 및 현장 반납 안내를 확인했습니다.</label><button className="primary-button sheet-cta" onClick={reserveGear}>이 장비 예약하기</button></section></div>:null}

      {catchballBuilderOpen ? <div className="overlay catchball-overlay" role="presentation"><section className="sheet catchball-sheet" role="dialog" aria-modal="true" aria-labelledby="catchball-builder-title"><div className="sheet-head"><div><span className="badge green">CREATE CATCH BALL</span><h2 id="catchball-builder-title">캐치볼 방 만들기</h2><p className="helper">장소와 시간을 올리면 가까운 야구인이 참여할 수 있어요.</p></div><button className="close-button" onClick={()=>setCatchballBuilderOpen(false)} aria-label="캐치볼 방 만들기 닫기"><X size={21}/></button></div>
        {catchballStep < 3 ? <div className="catchball-progress"><span className="active">1 장소</span><i/><span className={catchballStep>=2?"active":""}>2 시간·대상</span></div> : null}
        {catchballStep === 1 ? <div className="catchball-builder-step"><div className="room-step-title"><b>1</b><div><h3>어디에서 만날까요?</h3><p>사람들이 찾기 쉬운 공공장소를 선택하세요.</p></div></div><div className="catchball-place-list">{[{name:"갑천 체육공원",detail:"대전 서구 · 잔디광장"},{name:"유림공원 잔디광장",detail:"대전 유성구 · 조명 있음"},{name:"한밭수목원 운동장",detail:"대전 서구 · 주차 가능"}].map((place,index)=><button key={place.name} data-demo={index===0?"catchball-place-first":undefined} className={catchballPlace===place.name?"selected":""} onClick={()=>setCatchballPlace(place.name)}><MapPin size={19}/><span><strong>{place.name}</strong><small>{place.detail}</small></span><CheckCircle2 size={18}/></button>)}</div><button className="primary-button sheet-cta" data-demo="catchball-builder-next" disabled={!catchballPlace} onClick={()=>setCatchballStep(2)}>이 장소에서 시간 정하기</button></div> : null}
        {catchballStep === 2 ? <div className="catchball-builder-step"><div className="room-step-title"><b>2</b><div><h3>시간과 참여 대상을 정하세요.</h3><p>{catchballPlace} · 최대 4명</p></div></div><h4 className="choice-label">만날 시간</h4><div className="catchball-time-grid">{["오늘 20:00","내일 19:30","토요일 10:00"].map((time,index)=><button key={time} data-demo={index===0?"catchball-time-first":undefined} className={catchballTime===time?"selected":""} onClick={()=>setCatchballTime(time)}><Clock3 size={17}/><strong>{time}</strong></button>)}</div><h4 className="choice-label">참여 가능 경험</h4><div className="catchball-level-grid">{["초보자 환영","초급·중급","중급자"].map((level,index)=><button key={level} data-demo={index===0?"catchball-level-beginner":undefined} className={catchballLevel===level?"selected":""} onClick={()=>setCatchballLevel(level)}>{level}</button>)}</div><div className="my-catchball-profile"><span className="person-avatar">나</span><div><small>방장에게 표시되는 내 정보</small><strong>김플레이어 · 캐치볼 12회 · 초급자</strong></div></div><div className="room-actions"><button className="secondary-button" onClick={()=>setCatchballStep(1)}>이전</button><button className="primary-button" data-demo="catchball-create-confirm" disabled={!catchballTime} onClick={()=>{setCreatedCatchballRoom(true);setCatchballStep(3);setToast("캐치볼 약속방을 만들었어요.")}}>모집 시작하기</button></div></div> : null}
        {catchballStep === 3 ? <div className="catchball-created"><div className="success-mark"><CheckCircle2 size={42}/></div><span className="badge green">캐치볼 방 생성 완료</span><h3>같이 던질 사람을 기다리고 있어요!</h3><p>참가자가 들어오면 알림으로 알려드릴게요.</p><div className="catchball-ticket"><strong>저녁에 천천히 캐치볼해요</strong><span><Clock3 size={15}/>{catchballTime}</span><span><MapPin size={15}/>{catchballPlace}</span><small>{catchballLevel} · 1/4명</small></div><button className="primary-button sheet-cta" data-demo="catchball-create-finish" onClick={()=>setCatchballBuilderOpen(false)}>내가 만든 방 확인하기</button></div> : null}
      </section></div> : null}

      {selectedCatchballGroup ? <div className="overlay catchball-overlay" role="presentation"><section className="sheet catchball-detail-sheet" role="dialog" aria-modal="true" aria-labelledby="catchball-detail-title"><div className="sheet-head"><div><span className="badge green">CATCH BALL MATCH</span><h2 id="catchball-detail-title">{selectedCatchballGroup.title}</h2><p className="helper">{selectedCatchballGroup.city} · {selectedCatchballGroup.people}</p></div><button className="close-button" onClick={()=>setSelectedCatchballGroup(null)} aria-label="캐치볼 상세 닫기"><X size={21}/></button></div>
        {joinedCatchballId===selectedCatchballGroup.id ? <div className="catchball-appointment" data-demo="catchball-appointment"><div className="success-mark"><CheckCircle2 size={42}/></div><span className="badge green">약속 확정</span><h3>박정우님과 캐치볼 약속을 잡았어요!</h3><p>토요일 오전, 금강스포츠공원에서 만나요.</p><div className="appointment-info"><div><Clock3 size={19}/><span><small>시간</small><strong>{selectedCatchballGroup.time}</strong></span></div><div><MapPin size={19}/><span><small>장소</small><strong>{selectedCatchballGroup.place}</strong></span></div></div><div className="appointment-people"><h4>함께하는 사람들</h4><div className="catchball-person host"><span className="person-avatar">박</span><div><small>방장 · 박정우</small><strong>캐치볼 34회 · 중급자</strong></div><span className="manner-mini">매너 98</span></div><div className="catchball-person me"><span className="person-avatar">나</span><div><small>참가자 · 김플레이어</small><strong>캐치볼 12회 · 초급자</strong></div><span className="badge green">참가 확정</span></div></div><div className="safety-confirm"><ShieldCheck size={20}/><span>약속 전날과 2시간 전에 알림을 보내드려요.</span></div></div> : <><div className="catchball-detail-meta"><div><Clock3 size={20}/><span><small>만날 시간</small><strong>{selectedCatchballGroup.time}</strong></span></div><div><MapPin size={20}/><span><small>장소</small><strong>{selectedCatchballGroup.place}</strong></span></div></div><div className="host-profile-card"><span className="person-avatar large">{selectedCatchballGroup.host.name.slice(0,1)}</span><div><small>방장</small><h3>{selectedCatchballGroup.host.name}</h3><p>{selectedCatchballGroup.host.experience} · {selectedCatchballGroup.host.level}</p></div><span className="manner-score-mini">매너 {selectedCatchballGroup.host.manner}</span></div><div className="participant-preview"><div className="review-heading"><div><h3>현재 참가자</h3><p>캐치볼 경험과 수준을 미리 확인하세요.</p></div><span>{selectedCatchballGroup.people}</span></div>{selectedCatchballGroup.members.map((member)=><div className="catchball-person" key={member.name}><span className="person-avatar">{member.name.slice(0,1)}</span><div><small>참가자 · {member.name}</small><strong>{member.experience} · {member.level}</strong></div></div>)}</div><div className="my-join-profile"><CircleUserRound size={21}/><div><small>내 정보도 이렇게 표시돼요</small><strong>김플레이어 · 캐치볼 12회 · 초급자</strong></div></div><button className="primary-button sheet-cta" data-demo="catchball-join" onClick={()=>{setJoinedCatchballId(selectedCatchballGroup.id);setToast(`${selectedCatchballGroup.host.name}님과 캐치볼 약속이 확정됐어요.`)}}>이 약속에 참가하기</button></>}
      </section></div> : null}

      {resultOpen ? <div className="overlay result-overlay" role="presentation"><section className="sheet result-sheet" role="dialog" aria-modal="true" aria-labelledby="result-title"><div className="sheet-head"><div><span className="badge green">FINAL SCORE</span><h2 id="result-title">{completedGame.date} 경기 결과</h2><p className="helper">{completedGame.venue} · {completedGame.time}</p></div><button className="close-button" onClick={()=>setResultOpen(false)} aria-label="경기 결과 닫기"><X size={21}/></button></div>
        <div className="final-scoreboard"><div><span>{completedGame.home}</span><strong>{completedGame.homeScore}</strong></div><b>FINAL</b><div><span>{completedGame.away}</span><strong>{completedGame.awayScore}</strong></div></div>
        <section className="mvp-card" aria-label="경기 MVP"><div className="mvp-crown"><Award size={30}/></div><div><span>GAME MVP</span><h3>{completedGame.mvp.name} · {completedGame.mvp.position}</h3><p>{completedGame.mvp.summary}</p></div><Star size={25}/></section>
        <div className="review-principle"><ShieldCheck size={21}/><div><strong>리뷰는 더 안전하고 매너 있는 경기를 만드는 데 사용됩니다.</strong><p>주의 평가는 다른 참가자에게 공개되지 않으며, 복수의 일치하는 평가를 운영자가 확인한 뒤 안내합니다.</p></div></div>
        <div className="review-heading"><div><h3>함께 뛴 참가자 리뷰</h3><p>직접 경험한 행동을 기준으로 한 명씩 작성해 주세요.</p></div><span>{reviewedPlayerIds.length}/{completedGame.players.length} 완료</span></div>
        <div className="player-review-list">{completedGame.players.map((player)=><article key={player.id} className={reviewPlayerId===player.id?"selected":""}><div className="player-number">{player.number}</div><div><strong>{player.name}{player.mvp?<em>MVP</em>:null}</strong><span>{player.position} · {player.level}</span></div>{reviewedPlayerIds.includes(player.id)?<span className="review-done"><CheckCircle2 size={16}/>작성 완료</span>:<button className="secondary-button" data-demo={player.id===3?"review-player-3":undefined} onClick={()=>{setReviewPlayerId(player.id);setReviewTags([])}}>리뷰 쓰기</button>}</article>)}</div>
        {reviewPlayerId ? <section className="review-editor" aria-label="참가자 리뷰 작성"><div className="review-target"><MessageSquare size={19}/><span><small>리뷰 대상</small><strong>{completedGame.players.find((player)=>player.id===reviewPlayerId)?.name}</strong></span><button onClick={()=>{setReviewPlayerId(null);setReviewTags([])}}>취소</button></div><div className="review-tag-group positive"><h4>좋았던 점</h4><div>{positiveReviewTags.map((tag)=><button key={tag} className={reviewTags.includes(tag)?"selected":""} onClick={()=>toggleReviewTag(tag)} aria-pressed={reviewTags.includes(tag)}>{tag}</button>)}</div></div><div className="review-tag-group caution"><h4><AlertTriangle size={16}/>주의가 필요했던 행동</h4><p>감정이나 실력이 아닌, 실제로 확인한 행동만 선택해 주세요.</p><div>{cautionReviewTags.map((tag)=><button key={tag} data-demo={tag==="거친 플레이"?"review-caution-rough":undefined} className={reviewTags.includes(tag)?"selected":""} onClick={()=>toggleReviewTag(tag)} aria-pressed={reviewTags.includes(tag)}>{tag}</button>)}</div></div><div className="private-review-note"><ShieldCheck size={17}/>작성 내용은 운영 검토용으로만 보관되며 상대방에게 이름이 공개되지 않습니다.</div><button className="primary-button sheet-cta" data-demo="review-submit" disabled={reviewTags.length===0} onClick={submitPlayerReview}>이 리뷰 저장하기</button></section> : null}
        {reviewedPlayerIds.length > 0 && !showMyMannerReport ? <button className="received-review-cta" data-demo="open-my-review" onClick={()=>setShowMyMannerReport(true)}><span className="received-review-icon"><MessageSquare size={22}/></span><span><small>나에게 도착한 평가 4개</small><strong>다른 참가자들은 나를 어떻게 평가했을까요?</strong></span><ChevronRight size={20}/></button> : null}
        {showMyMannerReport ? <section className="my-manner-report" data-demo="my-manner-report" aria-label="내가 받은 매너 평가"><div className="manner-report-head"><div><span className="badge green">MY MANNER REPORT</span><h3>함께 뛰기 좋은 선수예요!</h3><p>이번 경기 참가자 4명의 평가를 익명으로 모았어요.</p></div><div className="manner-score"><strong>98</strong><span>매너 점수</span></div></div><div className="manner-summary-grid"><div><span>함께 뛰고 싶어요</span><strong>4<small>/4명</small></strong></div><div><span>받은 칭찬</span><strong>14<small>개</small></strong></div><div><span>주의 평가</span><strong className="safe">0<small>개</small></strong></div></div><div className="received-tag-list"><h4>내가 받은 칭찬</h4><div><span>매너 플레이 <b>4</b></span><span>안전하게 플레이해요 <b>4</b></span><span>팀원을 배려해요 <b>3</b></span><span>시간 약속을 지켜요 <b>3</b></span></div></div><div className="clear-manner-status"><ShieldCheck size={22}/><div><strong>주의가 필요한 행동이 없었어요.</strong><p>지금처럼 상대를 존중하고 안전하게 플레이해 주세요.</p></div></div><div className="anonymous-report-note"><CircleUserRound size={18}/><p>평가한 사람의 이름과 개별 응답은 공개하지 않아요. 여러 평가를 합산한 결과만 보여드립니다.</p></div><button className="secondary-button report-back" onClick={()=>setShowMyMannerReport(false)}>참가자 리뷰로 돌아가기</button></section> : null}
      </section></div> : null}

      {roomBuilderOpen ? <div className="overlay room-builder-overlay" role="presentation"><section className="sheet room-builder-sheet" role="dialog" aria-modal="true" aria-labelledby="room-builder-title">
        <div className="sheet-head"><div><span className="badge">HOST A MATCH</span><h2 id="room-builder-title">경기방 만들기</h2><p className="helper">구장을 먼저 확보한 뒤 참가자를 모집합니다.</p></div><button className="close-button" onClick={()=>setRoomBuilderOpen(false)} aria-label="방 만들기 닫기"><X size={21}/></button></div>
        {roomStep < 5 ? <div className="room-progress" aria-label={`방 만들기 ${roomStep}단계`}><span className={roomStep>=1?"active":""}>지역</span><i/><span className={roomStep>=2?"active":""}>구장</span><i/><span className={roomStep>=3?"active":""}>시간</span><i/><span className={roomStep>=4?"active":""}>결제</span></div> : null}

        {roomStep === 1 ? <div className="room-step"><div className="room-step-title"><b>1</b><div><h3>어느 지역에서 경기할까요?</h3><p>충청권 운영 구장을 지역별로 확인할 수 있어요.</p></div></div><div className="region-choice-grid">{["대전","세종","청주"].map((item)=><button key={item} data-demo={item==="대전"?"room-region-daejeon":undefined} className={roomRegion===item?"selected":""} onClick={()=>{setRoomRegion(item);setSelectedVenueId(null)}} aria-pressed={roomRegion===item}><MapPin size={18}/><strong>{item}</strong><span>{venues.filter((venue)=>venue.region===item).length}개 구장</span></button>)}</div><button className="primary-button sheet-cta" data-demo="room-region-next" onClick={()=>setRoomStep(2)}>이 지역 구장 보기</button></div> : null}

        {roomStep === 2 ? <div className="room-step"><div className="room-step-title"><b>2</b><div><h3>{roomRegion}의 구장을 선택하세요.</h3><p>대관료와 시설 정보를 비교해 보세요.</p></div></div><div className="venue-choice-list">{roomVenues.map((venue)=><button key={venue.id} data-demo={venue.id===1?"room-venue-first":undefined} className={selectedVenueId===venue.id?"selected":""} onClick={()=>{setSelectedVenueId(venue.id);setSelectedRoomTime("")}} aria-pressed={selectedVenueId===venue.id}><span className="venue-icon"><Building2 size={22}/></span><span><strong>{venue.name}</strong><small>{venue.address}</small><small>{venue.field}</small></span><b>{venue.fee.toLocaleString()}원</b></button>)}</div><div className="room-actions"><button className="secondary-button" onClick={()=>setRoomStep(1)}>이전</button><button className="primary-button" data-demo="room-venue-next" disabled={!selectedVenueId} onClick={()=>setRoomStep(3)}>빈 시간 확인</button></div></div> : null}

        {roomStep === 3 && selectedRoomVenue ? <div className="room-step"><div className="room-step-title"><b>3</b><div><h3>비어 있는 시간을 선택하세요.</h3><p>{selectedRoomVenue.name} · 9월 27일 토요일</p></div></div><div className="date-confirm"><CalendarDays size={21}/><span><small>경기 날짜</small><strong>2026년 9월 27일 (토)</strong></span><b>날짜 변경</b></div><div className="slot-grid">{selectedRoomVenue.slots.map((slot)=><button key={slot.time} data-demo={slot.time==="13:00–16:00"?"room-slot-first":undefined} disabled={!slot.available} className={selectedRoomTime===slot.time?"selected":""} onClick={()=>setSelectedRoomTime(slot.time)} aria-pressed={selectedRoomTime===slot.time}><Clock3 size={18}/><strong>{slot.time}</strong><span>{slot.available?"예약 가능":"예약 완료"}</span></button>)}</div><div className="room-actions"><button className="secondary-button" onClick={()=>setRoomStep(2)}>이전</button><button className="primary-button" data-demo="room-slot-next" disabled={!selectedRoomTime} onClick={()=>setRoomStep(4)}>이 시간 예약하기</button></div></div> : null}

        {roomStep === 4 && selectedRoomVenue ? <div className="room-step"><div className="room-step-title"><b>4</b><div><h3>예약 내용을 확인하고 결제하세요.</h3><p>결제가 완료되면 모집방이 즉시 공개됩니다.</p></div></div><div className="booking-summary"><div><MapPin size={18}/><span><small>구장</small><strong>{selectedRoomVenue.name}</strong></span></div><div><CalendarDays size={18}/><span><small>일정</small><strong>9월 27일 (토) · {selectedRoomTime}</strong></span></div><div><Users size={18}/><span><small>모집 정원</small><strong>20명</strong></span></div></div><div className="payment-summary"><span>구장 예약금</span><strong>{selectedRoomVenue.fee.toLocaleString()}원</strong><small>데모에서는 실제 금액이 청구되지 않습니다.</small></div><div className="secure-payment"><ShieldCheck size={19}/><span>결제 완료 후 모집 인원과 참가비를 설정할 수 있어요.</span></div><div className="room-actions"><button className="secondary-button" onClick={()=>setRoomStep(3)}>이전</button><button className="primary-button pay-room-button" data-demo="room-pay" onClick={confirmRoomCreation}><CreditCard size={18}/>{selectedRoomVenue.fee.toLocaleString()}원 결제하고 방 만들기</button></div></div> : null}

        {roomStep === 5 && createdRoom ? <div className="room-created"><div className="success-mark"><CheckCircle2 size={42}/></div><span className="badge green">모집방 생성 완료</span><h3>{createdRoom.date} 경기가 열렸어요!</h3><p>구장 예약이 확정됐습니다. 이제 함께 뛸 참가자를 모집할 수 있어요.</p><div className="created-ticket"><div><span>{createdRoom.venue.region}</span><strong>{createdRoom.venue.name}</strong><small>{createdRoom.date} · {createdRoom.time}</small></div><div><small>모집 현황</small><strong>0/{createdRoom.capacity}명</strong></div></div><button className="primary-button sheet-cta" data-demo="room-finish" onClick={()=>setRoomBuilderOpen(false)}>내 모집방 확인하기</button></div> : null}
      </section></div> : null}

      {showDemoIntro ? <div className="demo-intro-backdrop"><section className="demo-intro" role="dialog" aria-modal="true" aria-labelledby="demo-intro-title"><button className="close-button" onClick={()=>setShowDemoIntro(false)} aria-label="시연 안내 닫기"><X size={20}/></button><div className="demo-phone-icon">▶</div><p className="section-kicker">MOBILE DEMO</p><h2 id="demo-intro-title">어떤 흐름을 시연할까요?</h2><p>Windows 녹화를 시작한 뒤 원하는 시연을 고르면 커서가 직접 이동하고 클릭합니다.</p><div className="demo-choice-stack"><button className="primary-button demo-start" data-demo="demo-start" disabled={!demoIntroReady} onClick={runRecordingDemo}><span>01</span><b>경기 참가 시연</b><small>포지션·장비 선택부터 MY 확인까지</small></button><button className="primary-button demo-start room-demo-start" data-demo="room-demo-start" disabled={!demoIntroReady} onClick={runRoomCreationDemo}><span>02</span><b>방 만들기 시연</b><small>지역·구장·시간·결제·모집방 생성까지</small></button><button className="primary-button demo-start review-demo-start" data-demo="review-demo-start" disabled={!demoIntroReady} onClick={runPostGameReviewDemo}><span>03</span><b>경기 결과·리뷰 시연</b><small>종료 경기·MVP 확인과 비공개 매너 리뷰</small></button><button className="primary-button demo-start catchball-demo-start" data-demo="catchball-demo-start" disabled={!demoIntroReady} onClick={runCatchballDemo}><span>04</span><b>캐치볼 매칭 시연</b><small>방 만들기와 원하는 약속 참가를 한 번에</small></button></div><small>{demoIntroReady ? "각 시연은 약 20~30초 동안 자동으로 진행됩니다." : "전체 화면을 준비하고 있습니다…"}</small></section></div>:null}

      {demoCursor.visible ? <div className={`demo-cursor ${demoCursor.clicking ? "clicking" : ""}`} style={{ left: demoCursor.x, top: demoCursor.y }} aria-hidden="true"><span /></div> : null}

      {toast ? <div className="toast" role="status">{toast}</div> : null}
    </div>
  );
}
