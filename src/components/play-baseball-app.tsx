"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, CalendarDays, ChevronRight, CircleUserRound, Clock3, Home, MapPin, PackageCheck, Search, ShieldCheck, Trophy, Users, X } from "lucide-react";

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

const catchballGroups = [
  { id: 1, city: "대전", title: "퇴근 후 가볍게 캐치볼", place: "유림공원 잔디광장", time: "오늘 19:30", level: "입문 환영", people: "2/4명" },
  { id: 2, city: "세종", title: "주말 오전 수비 연습", place: "금강스포츠공원", time: "토요일 09:00", level: "초급", people: "3/6명" },
  { id: 3, city: "청주", title: "투수·포수 배터리 연습", place: "무심천 체육공원", time: "일요일 16:00", level: "경험자", people: "2/4명" },
];
const gearCatalog: Gear[] = [
  { id:1, name:"내야수 글러브", category:"글러브", fit:"우투 · 11.75인치", price:10000, stock:4, icon:"🥎", badge:"포지션 추천" },
  { id:2, name:"외야수 글러브", category:"글러브", fit:"우투 · 12.75인치", price:10000, stock:3, icon:"⚾", badge:"인기" },
  { id:3, name:"알루미늄 배트", category:"배트", fit:"33인치 · 900g", price:10000, stock:5, icon:"🏏", badge:"공인 규격" },
  { id:4, name:"타자 헬멧", category:"보호장비", fit:"양귀 · M/L", price:10000, stock:8, icon:"🪖", badge:"안전 점검" },
  { id:5, name:"포수 보호 세트", category:"보호장비", fit:"마스크·프로텍터·렉가드", price:10000, stock:2, icon:"🛡️", badge:"세트 대여" },
  { id:6, name:"입문자 스타터 세트", category:"세트", fit:"글러브·배트·헬멧", price:10000, stock:3, icon:"🎒", badge:"첫 경기 추천" },
];

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
  const [demoPresentation, setDemoPresentation] = useState(false);
  const [demoCursor, setDemoCursor] = useState({ visible: false, x: 215, y: 466, clicking: false });
  const [selectedGear, setSelectedGear] = useState<Gear | null>(null);
  const [gearCategory, setGearCategory] = useState("전체");
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [addGearToMatch, setAddGearToMatch] = useState(false);
  const [matchGearIds, setMatchGearIds] = useState<number[]>([]);

  const filteredMatches = useMemo(
    () => region === "전체" ? matches : matches.filter((match) => match.city === region),
    [region],
  );

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
    setShowDemoIntro(true);
    window.scrollTo({ top: 0, behavior: "auto" });
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
    } catch {}
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

  function reserveGear() {
    if (!selectedGear) return;
    setRentals((current) => [{ gear:selectedGear, match:matches[0], status:"예약 완료" }, ...current.filter((item) => item.gear.id !== selectedGear.id)]);
    setSelectedGear(null);
    setToast("장비 예약이 완료됐어요. 경기 30분 전 운영 부스에서 받아보세요.");
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
          <div className="section-head"><div><h2 className="display">가까운 캐치볼 모임</h2><p>현재 모집 중인 충청권 모임입니다.</p></div><button className="secondary-button" onClick={() => setToast("캐치볼 모임 만들기는 다음 시연 단계에서 연결됩니다.")}>+ 모임 만들기</button></div>
          <div className="catchball-grid">{catchballGroups.map((group) => <article className="catchball-card" key={group.id}><div className="catchball-top"><span className="badge">{group.city}</span><span className="open-dot">모집 중</span></div><h3>{group.title}</h3><div className="meta"><div className="meta-row"><Clock3 size={17}/>{group.time}</div><div className="meta-row"><MapPin size={17}/>{group.place}</div></div><div className="catchball-footer"><div><span className="badge green">{group.level}</span><span><Users size={15}/>{group.people}</span></div><button className="primary-button" onClick={() => setToast(`${group.title} 참여 요청을 보냈어요.`)}>함께하기</button></div></article>)}</div>
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
        <button className={`nav-item ${activeTab === "home" ? "active" : ""}`} onClick={() => setActiveTab("home")}><Home size={20} aria-hidden="true" />홈</button>
        <button className={`nav-item ${activeTab === "search" ? "active" : ""}`} onClick={() => setActiveTab("search")}><Search size={20} aria-hidden="true" />경기 찾기</button>
        <button className={`nav-item ${activeTab === "catchball" ? "active" : ""}`} onClick={() => setActiveTab("catchball")}><Users size={20} aria-hidden="true" />캐치볼</button>
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

      {showDemoIntro ? <div className="demo-intro-backdrop"><section className="demo-intro" role="dialog" aria-modal="true" aria-labelledby="demo-intro-title"><button className="close-button" onClick={()=>setShowDemoIntro(false)} aria-label="시연 안내 닫기"><X size={20}/></button><div className="demo-phone-icon">▶</div><p className="section-kicker">MOBILE DEMO</p><h2 id="demo-intro-title">녹화 준비가 되셨나요?</h2><p>Windows 녹화를 시작한 뒤 아래 버튼을 누르면 커서가 직접 이동하며 시연합니다.</p><ol><li><b>1</b><span>경기 참가하기</span></li><li><b>2</b><span>포지션·장비 선택</span></li><li><b>3</b><span>MY 신청 현황 확인</span></li><li><b>4</b><span>내 정보 확인</span></li></ol><button className="primary-button demo-start" data-demo="demo-start" onClick={runRecordingDemo}>시연 시작</button><small>약 20초 동안 자동으로 진행됩니다.</small></section></div>:null}

      {demoCursor.visible ? <div className={`demo-cursor ${demoCursor.clicking ? "clicking" : ""}`} style={{ left: demoCursor.x, top: demoCursor.y }} aria-hidden="true"><span /></div> : null}

      {toast ? <div className="toast" role="status">{toast}</div> : null}
    </div>
  );
}
