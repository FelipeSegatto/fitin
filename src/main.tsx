import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Home,
  BookOpen,
  TrendingUp,
  Trophy,
  User,
  Bell,
  PlusCircle,
  Flame,
  Utensils,
  Dumbbell,
  X,
  LoaderCircle,
  Check,
  LogOut,
} from "lucide-react";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import "./styles.css";
import { Achievements, type AchievementHistory } from "./Achievements";
type Screen =
  | "welcome"
  | "login"
  | "recovery"
  | "signup"
  | "loading"
  | "result"
  | "plan"
  | "home";
type Profile = {
  email: string;
  birth: string;
  age: string;
  password: string;
  confirm: string;
  name: string;
  sex: string;
  weight: string;
  height: string;
  neck: string;
  waist: string;
  hip: string;
  activity: string;
  goal: string;
};
const initial: Profile = {
  email: "",
  birth: "",
  age: "",
  password: "",
  confirm: "",
  name: "",
  sex: "",
  weight: "",
  height: "",
  neck: "",
  waist: "",
  hip: "",
  activity: "",
  goal: "",
};
const measureKeys = ["weight", "height", "neck", "waist", "hip"] as const;
type MeasureKey = (typeof measureKeys)[number];
function ageFromBirth(birth: string): string {
  const d = new Date(birth + "T12:00:00");
  if (!birth || !Number.isFinite(d.getTime())) return "";
  const now = new Date();
  const birthday = new Date(now.getFullYear(), d.getMonth(), d.getDate());
  return String(now.getFullYear() - d.getFullYear() - (now < birthday ? 1 : 0));
}
function birthFromAge(age: string, birth: string): string {
  const value = Number(age);
  if (!age || !Number.isInteger(value) || value < 1 || value > 125)
    return birth;
  const now = new Date(),
    previous = new Date(birth + "T12:00:00");
  const month = Number.isFinite(previous.getTime())
    ? previous.getMonth()
    : now.getMonth();
  const day = Number.isFinite(previous.getTime())
    ? previous.getDate()
    : now.getDate();
  const year =
    now.getFullYear() -
    value -
    (now < new Date(now.getFullYear(), month, day) ? 1 : 0);
  const validDay = Math.min(day, new Date(year, month + 1, 0).getDate());
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(validDay).padStart(2, "0")}`;
}
const activities = [
  ["Sedentário", "Pouco ou nenhum exercício", "purple"],
  ["Leve", "Exercícios 1 a 3 vezes por semana", "blue"],
  ["Moderado", "Exercícios 3 a 5 vezes por semana", "coral"],
  ["Alto", "Treinos pesados 6 a 7 vezes por semana", "mint"],
  ["Muito alto", "Atletas com rotina dupla ou trabalho físico", "yellow"],
];
const goals = [
  ["Emagrecer", "Foco em queima de gordura e déficit calórico", "mint"],
  ["Ganhar massa", "Foco em hipertrofia e superávit calórico", "blue"],
  ["Manter peso", "Foco em manutenção e equilíbrio no dia a dia", "yellow"],
];
const demoNotice =
  "Demonstração · Sem autenticação ou orientação nutricional real";
function Logo() {
  return <img className="logo" src="/assets/logo.svg" alt="FitIn" />;
}
function Mascot({
  name = "buddy",
  className = "",
}: {
  name?: string;
  className?: string;
}) {
  return (
    <img
      className={"mascot " + className}
      src={"/assets/" + name + ".svg"}
      alt=""
    />
  );
}
function App() {
  const [screen, setScreen] = useState<Screen>("welcome"),
    [profile, setProfile] = useState<Profile>(initial),
    [step, setStep] = useState(0),
    [skippedMeasures, setSkippedMeasures] = useState<MeasureKey[]>([]),
    [planStep, setPlanStep] = useState(0),
    [errors, setErrors] = useState<Record<string, string>>({}),
    [busy, setBusy] = useState(false),
    [showPassword, setShowPassword] = useState(false),
    [loginEmail, setLoginEmail] = useState(""),
    [loginPassword, setLoginPassword] = useState(""),
    [recovered, setRecovered] = useState(false),
    [rate, setRate] = useState(0.55),
    [tab, setTab] = useState("Home"),
    [streak, setStreak] = useState(0),
    [achievementHistory, setAchievementHistory] = useState<AchievementHistory>({
      days: 0,
      meals: 0,
      burned: 0,
    }),
    [modal, setModal] = useState(""),
    [foods, setFoods] = useState<{ name: string; kcal: number }[]>([]),
    [workouts, setWorkouts] = useState<{ name: string; kcal: number }[]>([]);
  const change = (key: keyof Profile, value: string) => {
    setProfile((p) => ({
      ...p,
      [key]: value,
      ...(key === "birth" ? { age: ageFromBirth(value) } : {}),
      ...(key === "age" ? { birth: birthFromAge(value, p.birth) } : {}),
    }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };
  const go = (s: Screen) => {
    setErrors({});
    setScreen(s);
  };
  const goal = profile.goal || "Emagrecer";
  const maintenance = 2450;
  const target =
    goal === "Manter peso"
      ? maintenance
      : Math.round(
          (maintenance +
            ((goal === "Ganhar massa" ? 1 : -1) * rate * 7700) / 7) /
            50,
        ) * 50;
  const consumed = foods.reduce((s, i) => s + i.kcal, 0),
    burned = workouts.reduce((s, i) => s + i.kcal, 0),
    remaining = target - consumed + burned;
  const nextSignup = () => {
    const e: Record<string, string> = {};
    if (step === 0) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email))
        e.email = "Digite um e-mail válido.";
      const d = new Date(profile.birth + "T12:00:00");
      if (
        !profile.birth ||
        !Number.isFinite(d.getTime()) ||
        d > new Date() ||
        d.getFullYear() < 1900
      )
        e.birth = "Digite uma data de nascimento válida.";
      if (!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(profile.password))
        e.password = "A senha deve ter 8 caracteres, uma letra e um número.";
      if (profile.password !== profile.confirm || !profile.confirm)
        e.confirm = "As senhas não coincidem.";
    }
    if (step === 1) {
      if (!profile.name.trim()) e.name = "Como podemos chamar você?";
      if (!profile.sex) e.sex = "Selecione uma opção.";
    }
    if (step === 2) {
      if (
        !profile.age ||
        !Number.isInteger(Number(profile.age)) ||
        Number(profile.age) < 1 ||
        Number(profile.age) > 125
      )
        e.age = "Informe uma idade válida.";
      for (const k of measureKeys) {
        if (skippedMeasures.includes(k)) continue;
        const v = Number(profile[k]);
        if (!Number.isFinite(v) || v <= 0 || v > 500)
          e[k] = "Informe uma medida válida.";
      }
    }
    if (step === 3 && !profile.activity)
      e.activity = "Escolha seu nível de atividade.";
    if (step === 4 && !profile.goal) e.goal = "Escolha seu objetivo.";
    setErrors(e);
    if (Object.keys(e).length) return;
    if (step < 4) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    } else {
      setProfile((p) => ({ ...p, password: "", confirm: "" }));
      setFoods([]);
      setWorkouts([]);
      setStreak(0);
      setAchievementHistory({ days: 0, meals: 0, burned: 0 });
      go("loading");
      setTimeout(() => go("result"), 900);
    }
  };
  const field = (
    key: keyof Profile,
    label: string,
    type = "text",
    unit = "",
    disabled = false,
  ) => (
    <label className="field" key={key}>
      <span>{label}</span>
      <div className={"input-wrap " + (errors[key] ? "invalid" : "")}>
        <input
          disabled={disabled}
          aria-label={label}
          aria-invalid={!!errors[key]}
          aria-describedby={errors[key] ? key + "-error" : undefined}
          type={type === "password" && showPassword ? "text" : type}
          value={profile[key]}
          onChange={(e) => change(key, e.target.value)}
          autoComplete={
            key === "password"
              ? "new-password"
              : key === "email"
                ? "email"
                : key === "birth"
                  ? "bday"
                  : "off"
          }
          inputMode={type === "number" ? "decimal" : undefined}
        />
        {unit && <small>{unit}</small>}
        {type === "password" && (
          <button
            type="button"
            className="icon"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        )}
      </div>
      {errors[key] && (
        <small className="error" id={key + "-error"}>
          {errors[key]}
        </small>
      )}
    </label>
  );
  const measure = (key: MeasureKey, label: string, unit: string) => {
    const skipped = skippedMeasures.includes(key);
    return (
      <div className="measure-field">
        {field(key, label, "number", unit, skipped)}
        <button
          type="button"
          className="measure-skip"
          aria-label={`${skipped ? "Informar agora" : "Informar depois"}: ${label}`}
          aria-pressed={skipped}
          onClick={() => {
            setSkippedMeasures((current) =>
              skipped ? current.filter((k) => k !== key) : [...current, key],
            );
            change(key, "");
          }}
        >
          {skipped ? "Informar agora" : "Não sei / informar depois"}
        </button>
      </div>
    );
  };
  const authHero = (
    <div className="auth-hero">
      <Mascot name="welcome-buddy" />
      <div className="cream-wave" />
    </div>
  );
  const loginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      loginEmail.toLowerCase() !== "demo@fitin.app" ||
      loginPassword !== "fitin123"
    ) {
      setErrors({
        login: "E-mail ou senha incorretos. Use a conta demonstrativa abaixo.",
      });
      return;
    }
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      setTab("Home");
      setRate(0.4);
      setStreak(7);
      setAchievementHistory({ days: 17, meals: 14, burned: 6250 });
      setFoods([
        { name: "Café da manhã: pão, ovos e fruta", kcal: 370 },
        { name: "Lanche: arroz, frango +", kcal: 556 },
      ]);
      setWorkouts([{ name: "Musculação · 40 min", kcal: 150 }]);
      setProfile((p) => ({
        ...p,
        name: "João",
        activity: "Moderado",
        goal: "Emagrecer",
      }));
      go("home");
    }, 450);
  };
  const enterHome = () => {
    setScreen("home");
    setTab("Home");
  };
  const formTitle = [
    "Vamos começar!",
    "Queremos te conhecer",
    "Suas medidas",
    "Seu ritmo atual",
    "Qual sua meta?",
  ][step];
  return (
    <div className={"app " + (screen === "home" ? "dashboard-mode" : "")}>
      <aside className="desktop-intro">
        <Logo />
        <div>
          <span className="eyebrow">YOUR FITNESS BUDDIES.</span>
          <h1>
            Seu ritmo.
            <br />
            Seus objetivos.
            <br />
            <em>Sua companhia.</em>
          </h1>
          <p>
            Pequenos passos também contam.
            <br />
            Vamos encontrar o que funciona para você.
          </p>
        </div>
        <div className="buddy-garden">
          <Mascot />
          <Mascot name="desktop-girl" />
          <Mascot name="desktop-crown" />
          <Mascot name="desktop-chef" />
        </div>
        <small>{demoNotice}</small>
      </aside>
      <main className={"surface " + screen}>
        {screen === "welcome" && (
          <>
            <div className="welcome-art">{authHero}</div>
            <div className="welcome-content">
              <Logo />
              <p className="tagline">Your Fitness Buddies.</p>
              <button className="primary" onClick={() => go("login")}>
                Entrar
              </button>
              <button
                className="outline"
                onClick={() => {
                  setStep(0);
                  go("signup");
                }}
              >
                Cadastre-se
              </button>
              <small className="demo-note">
                Uma experiência demonstrativa do FitIn.
              </small>
            </div>
          </>
        )}
        {(screen === "login" || screen === "recovery") && (
          <>
            {authHero}
            <div className="auth-body">
              <button
                className="back"
                onClick={() => go(screen === "recovery" ? "login" : "welcome")}
              >
                <ArrowLeft size={18} /> Voltar
              </button>
              <Logo />
              <h2>{screen === "login" ? "Faça login" : "Recuperar senha"}</h2>
              <p className="subtitle">
                {screen === "login"
                  ? "Entre com seu e-mail e senha."
                  : "Digite seu e-mail para receber um link de recuperação."}
              </p>
              <form
                onSubmit={
                  screen === "login"
                    ? loginSubmit
                    : (e) => {
                        e.preventDefault();
                        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail)) {
                          setErrors({ login: "Digite um e-mail válido." });
                          return;
                        }
                        setErrors({});
                        setRecovered(true);
                      }
                }
              >
                <label className="field">
                  <span>E-mail</span>
                  <div
                    className={"input-wrap " + (errors.login ? "invalid" : "")}
                  >
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      autoComplete="email"
                      required
                    />
                  </div>
                </label>
                {screen === "login" && (
                  <label className="field">
                    <span>Senha</span>
                    <div className="input-wrap">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        autoComplete="current-password"
                        required
                      />
                      <button
                        type="button"
                        className="icon"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label="Alternar visibilidade da senha"
                      >
                        <EyeOff size={18} />
                      </button>
                    </div>
                  </label>
                )}
                {errors.login && (
                  <p className="error" role="alert">
                    {errors.login}
                  </p>
                )}
                {recovered && screen === "recovery" && (
                  <p className="success" role="status">
                    Fluxo demonstrativo: em uma conta real, o link seria enviado
                    por e-mail.
                  </p>
                )}
                <button className="primary" disabled={busy}>
                  {busy ? (
                    <>
                      <LoaderCircle className="spin" size={18} /> Entrando…
                    </>
                  ) : screen === "login" ? (
                    "Entrar"
                  ) : (
                    "Enviar link"
                  )}
                </button>
              </form>
              <button
                className="text-button"
                onClick={() => {
                  setRecovered(false);
                  go(screen === "login" ? "recovery" : "login");
                }}
              >
                {screen === "login" ? "Esqueceu a senha?" : "Voltar ao login"}
              </button>
              {screen === "login" && (
                <div className="demo-account">
                  Conta de demonstração
                  <br />
                  <strong>demo@fitin.app · fitin123</strong>
                  <button
                    className="text-button"
                    onClick={() => {
                      setLoginEmail("demo@fitin.app");
                      setLoginPassword("fitin123");
                      setErrors({});
                    }}
                  >
                    Preencher dados
                  </button>
                </div>
              )}
            </div>
          </>
        )}
        {screen === "signup" && (
          <>
            <div
              className={
                "signup-hero " + ["purple", "pink", "blue", "", ""][step]
              }
            >
              <button
                className="back"
                aria-label="Voltar à etapa anterior"
                onClick={() => (step ? setStep(step - 1) : go("welcome"))}
              >
                <ArrowLeft size={20} />
              </button>
              {step < 3 && <Mascot name={["buddy", "sport", "party"][step]} />}
            </div>
            <div className="signup-body">
              <div className="progress-label">
                <span>Etapa {step + 1} de 5</span>
                <span>{(step + 1) * 20}%</span>
              </div>
              <div className="progress">
                <i style={{ width: (step + 1) * 20 + "%" }} />
              </div>
              <h2>{formTitle}</h2>
              <p className="subtitle">
                {
                  [
                    "Precisamos do seu e-mail e data de nascimento para o cadastro.",
                    "Conte um pouco sobre você para prepararmos seu plano.",
                    "Medidas para demonstrar a personalização do seu plano.",
                    "Qual é o seu nível de atividade física diária?",
                    "Podemos ajustar suas metas depois. Relaxa!",
                  ][step]
                }
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  nextSignup();
                }}
                noValidate
              >
                {step === 0 && (
                  <>
                    {field("email", "E-mail", "email")}
                    {field("birth", "Data de nascimento", "date")}
                    {field("password", "Senha", "password")}
                    {field("confirm", "Confirmar senha", "password")}
                  </>
                )}
                {step === 1 && (
                  <>
                    {field("name", "Seu nome")}
                    <fieldset>
                      <legend>Sexo biológico</legend>
                      <div className="pills">
                        {["Feminino", "Masculino", "Outro"].map((v) => (
                          <button
                            key={v}
                            type="button"
                            className={profile.sex === v ? "selected" : ""}
                            aria-pressed={profile.sex === v}
                            onClick={() => change("sex", v)}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                      {errors.sex && (
                        <small className="error">{errors.sex}</small>
                      )}
                    </fieldset>
                  </>
                )}
                {step === 2 && (
                  <>
                    <p className="measure-help">
                      Não tem alguma medida? Você pode informar depois.
                    </p>
                    <button
                      type="button"
                      className="skip-all"
                      onClick={() => {
                        setSkippedMeasures([...measureKeys]);
                        setProfile((p) => ({
                          ...p,
                          ...Object.fromEntries(
                            measureKeys.map((k) => [k, ""]),
                          ),
                        }));
                        setErrors({});
                      }}
                    >
                      Informar todas as medidas depois
                    </button>
                    <div className="measure-row">
                      {field("age", "Idade", "number", "anos")}
                      {measure("weight", "Peso (kg)", "kg")}
                    </div>
                    {measure("height", "Altura (cm)", "cm")}
                    {measure("neck", "Pescoço (cm)", "cm")}
                    {measure("waist", "Cintura (cm)", "cm")}
                    {measure("hip", "Quadril (cm)", "cm")}
                  </>
                )}
                {step === 3 && (
                  <div className="choices">
                    {activities.map(([v, d, c]) => (
                      <button
                        key={v}
                        type="button"
                        className={
                          "choice " +
                          c +
                          (profile.activity === v ? " chosen" : "")
                        }
                        aria-pressed={profile.activity === v}
                        onClick={() => change("activity", v)}
                      >
                        <span className="check">
                          {profile.activity === v && <Check size={18} />}
                        </span>
                        <span>
                          <strong>{v}</strong>
                          <small>{d}</small>
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                {step === 4 && (
                  <div className="choices">
                    {goals.map(([v, d, c]) => (
                      <button
                        key={v}
                        type="button"
                        className={
                          "choice " + c + (profile.goal === v ? " chosen" : "")
                        }
                        aria-pressed={profile.goal === v}
                        onClick={() => change("goal", v)}
                      >
                        <span className="check">
                          {profile.goal === v && <Check size={18} />}
                        </span>
                        <span>
                          <strong>{v}</strong>
                          <small>{d}</small>
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                {errors.activity && (
                  <p className="error" role="alert">
                    {errors.activity}
                  </p>
                )}
                {errors.goal && (
                  <p className="error" role="alert">
                    {errors.goal}
                  </p>
                )}
                <button className="primary next">
                  {step === 4 ? "Calcular meu plano!" : "Próximo"}
                </button>
              </form>
              <p className="demo-note">
                Use dados de exemplo. O plano desta versão é ilustrativo.
              </p>
            </div>
          </>
        )}
        {screen === "loading" && (
          <div className="loading-content">
            <Mascot name="happy" />
            <h2>Preparando seu plano…</h2>
            <p className="subtitle">Isso leva só alguns segundos.</p>
            <LoaderCircle className="spin orange" aria-label="Carregando" />
          </div>
        )}
        {screen === "result" && (
          <div className="result-body">
            <Mascot name="coach" />
            <h2>Seu Plano FitIn!</h2>
            <p className="subtitle">Um primeiro olhar para a sua jornada.</p>
            <div className="stat coral">
              <small>META CALÓRICA DEMONSTRATIVA</small>
              <strong>
                {target.toLocaleString("pt-BR")} <small>kcal</small>
              </strong>
              <span>Você pode ajustar o ritmo a seguir.</span>
            </div>
            <div className="stat yellow">
              <small>NÍVEL DE ATIVIDADE</small>
              <strong>{profile.activity}</strong>
              <span>Sua escolha no cadastro</span>
            </div>
            <div className="stat purple">
              <small>IMC</small>
              <strong>
                {profile.weight && profile.height
                  ? (
                      Number(profile.weight) /
                      (Number(profile.height) / 100) ** 2
                    ).toLocaleString("pt-BR", { maximumFractionDigits: 1 })
                  : "—"}
              </strong>
              <span>Relação entre peso e altura informados</span>
            </div>
            <div className="stat mint">
              <small>BODY FAT APROXIMADO</small>
              <strong>—</strong>
              <span>Estimativa ainda não implementada</span>
            </div>
            <div className="stat blue">
              <small>TAXA METABÓLICA BASAL</small>
              <strong>—</strong>
              <span>Regra de cálculo a definir</span>
            </div>
            <p className="demo-note">
              Cenário fictício: manutenção de 2.450 kcal. As medidas não geram
              uma prescrição nesta demo.
            </p>
            <button
              className="primary"
              onClick={() => {
                setPlanStep(0);
                go("plan");
              }}
            >
              Avançar
            </button>
          </div>
        )}
        {screen === "plan" && (
          <div className={"plan-body plan-" + planStep}>
            <div className="steps">
              {[0, 1, 2, 3].map((i) => (
                <i key={i} className={i <= planStep ? "active" : ""} />
              ))}
            </div>
            <button
              className="back"
              onClick={() =>
                planStep ? setPlanStep(planStep - 1) : go("result")
              }
            >
              <ArrowLeft size={18} /> Voltar
            </button>
            <span className="eyebrow">PASSO {planStep + 1} DE 4</span>
            <h1>{planStep === 3 ? "Seu ritmo" : "Plano atual"}</h1>
            {planStep === 0 && (
              <>
                <p className="subtitle">
                  Feito com o que você respondeu no cadastro.
                  <br />
                  Nada aqui é definitivo.
                </p>
                <div className="card calorie">
                  <small>META DIÁRIA</small>
                  <p>Manutenção {maintenance.toLocaleString("pt-BR")}</p>
                  <strong>
                    {target.toLocaleString("pt-BR")} <small>kcal</small>
                  </strong>
                </div>
                <div className="mini-grid">
                  <div className="blue">
                    <small>OBJETIVO</small>
                    <strong>{goal}</strong>
                  </div>
                  <div className="coral">
                    <small>RITMO</small>
                    <strong>
                      {goal === "Manter peso"
                        ? "Manutenção"
                        : rate.toLocaleString("pt-BR") + " kg/semana"}
                    </strong>
                  </div>
                </div>
                <div className="plan-art">
                  <Mascot name="happy" />
                </div>
              </>
            )}
            {planStep === 1 && (
              <>
                <h3>Como o dia se divide</h3>
                <div className="card macros">
                  {[
                    ["Proteína", 0.3, 4, "blue"],
                    ["Carboidrato", 0.4, 4, "yellow"],
                    ["Gordura", 0.3, 9, "purple"],
                  ].map(([n, f, d, c]) => (
                    <div key={String(n)}>
                      <div>
                        <strong>{n}</strong>
                        <span>
                          {Math.round((target * Number(f)) / Number(d))}g
                        </span>
                      </div>
                      <div className="macro-bar">
                        <i
                          className={String(c)}
                          style={{ width: Number(f) * 200 + "%" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="encourage purple">
                  <p>
                    Não precisa acertar na régua.
                    <br />
                    Chegar perto todo dia já conta.
                  </p>
                  <Mascot name="coach" />
                </div>
              </>
            )}
            {planStep === 2 && (
              <>
                <h3>As próximas 8 semanas</h3>
                <div className="card projection">
                  <div
                    className={
                      "bars " + (goal === "Ganhar massa" ? "gaining" : "")
                    }
                  >
                    {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                      <i
                        key={i}
                        style={{
                          height:
                            goal === "Manter peso" ? "65%" : 95 - i * 9 + "%",
                        }}
                      />
                    ))}
                  </div>
                  <div>
                    <span>Hoje</span>
                    <span>Semana 8</span>
                  </div>
                </div>
                <div className="mini-grid">
                  <div className="mint">
                    <small>PROJEÇÃO ILUSTRATIVA</small>
                    <strong>
                      {goal === "Manter peso"
                        ? "Manutenção"
                        : (goal === "Ganhar massa" ? "+" : "−") +
                          (rate * 8).toLocaleString("pt-BR", {
                            maximumFractionDigits: 1,
                          }) +
                          " kg"}
                    </strong>
                  </div>
                  <div className="blue">
                    <small>REGISTROS</small>
                    <strong>2 por dia</strong>
                  </div>
                </div>
                <p className="demo-note">
                  Projeção fictícia. O FitIn não substitui orientação médica ou
                  nutricional.
                </p>
              </>
            )}
            {planStep === 3 && (
              <>
                <Mascot name="coach" className="rhythm-mascot" />
                <p className="subtitle">
                  Mais rápido exige mais disciplina. Mais devagar cabe melhor na
                  rotina. Escolha o que você sustenta.
                </p>
                <div className="card calorie">
                  <div className="rhythm-label">
                    <small>META DIÁRIA</small>
                    <span>Equilibrado</span>
                  </div>
                  <strong>
                    {target.toLocaleString("pt-BR")} <small>kcal</small>
                  </strong>
                  {goal !== "Manter peso" && (
                    <>
                      <input
                        type="range"
                        min="0.2"
                        max="0.8"
                        step="0.05"
                        value={rate}
                        onChange={(e) => setRate(Number(e.target.value))}
                        aria-label="Ritmo semanal"
                      />
                      <div className="range-label">
                        <span>Devagar</span>
                        <strong>
                          {rate.toLocaleString("pt-BR")} kg por semana
                        </strong>
                        <span>Rápido</span>
                      </div>
                    </>
                  )}
                </div>
                <div className="encourage pink">
                  Um ritmo que costuma caber numa rotina normal, sem virar
                  segundo emprego.
                </div>
              </>
            )}
            <button
              className="primary plan-next"
              onClick={() =>
                planStep < 3 ? setPlanStep(planStep + 1) : enterHome()
              }
            >
              {
                [
                  "Ver como fica o dia",
                  "Continuar",
                  "Quero ajustar o ritmo",
                  "Bora começar",
                ][planStep]
              }
            </button>
            {planStep === 3 && (
              <button className="text-button" onClick={enterHome}>
                Prefiro decidir depois
              </button>
            )}
            <small className="demo-note">
              Plano demonstrativo, sem recomendação nutricional.
            </small>
          </div>
        )}
        {screen === "home" && (
          <div className={"home-body " + (streak > 0 ? "demo-filled" : "")}>
            <header>
              <Logo />
              <button
                className="icon"
                aria-label="Notificações"
                onClick={() => setModal("notifications")}
              >
                <Bell size={20} />
              </button>
            </header>
            {tab === "Home" && (
              <>
                <div
                  className={"home-banner " + (foods.length ? "started" : "")}
                >
                  <div>
                    <h2>
                      {streak > 1
                        ? `Streak de ${streak} dias!`
                        : foods.length
                          ? "Você começou!"
                          : "Vamos começar!"}
                    </h2>
                    <p>
                      {streak > 1
                        ? "Muito bem! Continue registrando e mantenha o progresso em dia."
                        : foods.length
                          ? "Cada registro é um passo na sua jornada."
                          : "Registre sua primeira refeição para iniciar sua sequência de dias."}
                    </p>
                  </div>
                  <Mascot name={foods.length ? "streak-buddy" : "buddy"} />
                </div>
                <div className="card daily">
                  <div className="card-title">
                    <h3>Resumo Diário</h3>
                    {foods.length ? (
                      <small className="daily-equation">
                        {target} − <span>{consumed}</span> + <em>{burned}</em> ={" "}
                        <strong>{remaining} kcal</strong>
                      </small>
                    ) : (
                      <small>
                        meta do dia = {target.toLocaleString("pt-BR")} kcal
                      </small>
                    )}
                  </div>
                  <div className="daily-content">
                    <div
                      className="ring"
                      style={{
                        background: `conic-gradient(#ff8774 ${Math.min(100, Math.max(0, (consumed / target) * 100))}%,#efe3d4 0)`,
                      }}
                    >
                      <div>
                        <strong>{remaining.toLocaleString("pt-BR")}</strong>
                        <small>kcal restantes</small>
                      </div>
                    </div>
                    <div className="daily-values">
                      <p>
                        <Flame />
                        <span>
                          Meta diária
                          <strong>{target.toLocaleString("pt-BR")} kcal</strong>
                        </span>
                      </p>
                      <p>
                        <Utensils />
                        <span>
                          Consumidas<strong>{consumed} kcal</strong>
                        </span>
                      </p>
                      <p>
                        <Dumbbell />
                        <span>
                          Exercícios<strong>{burned} kcal</strong>
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="home-actions">
                  <button className="primary" onClick={() => setModal("food")}>
                    <PlusCircle size={17} /> Adicionar alimentos
                  </button>
                  <button
                    className="outline"
                    onClick={() => setModal("workout")}
                  >
                    <PlusCircle size={17} /> Adicionar atividades
                  </button>
                </div>
                <h3>Hoje</h3>
                <div className="card today-workouts">
                  <strong>
                    {workouts.length
                      ? "Suas atividades"
                      : "Nenhuma atividade ainda"}
                  </strong>
                  {workouts.length ? (
                    workouts.map((i, n) => (
                      <p key={n}>
                        {i.name} <span>{i.kcal} kcal</span>
                      </p>
                    ))
                  ) : (
                    <p>Seus treinos do dia aparecem aqui.</p>
                  )}
                </div>
                <div className="card today-meals">
                  <strong>
                    {foods.length ? "Suas refeições" : "Nenhuma refeição ainda"}
                  </strong>
                  {foods.length ? (
                    foods.map((i, n) => (
                      <p key={n}>
                        {i.name} <span>{i.kcal} kcal</span>
                      </p>
                    ))
                  ) : (
                    <p>Suas refeições do dia aparecem aqui.</p>
                  )}
                </div>
              </>
            )}
            {tab === "Diário" && (
              <>
                <h1>Seu diário</h1>
                <p>Os registros desta sessão, no seu ritmo.</p>
                {!foods.length && !workouts.length ? (
                  <div className="empty">
                    <Mascot name="party" />
                    <p>Seu primeiro registro pode começar hoje.</p>
                    <button
                      className="primary"
                      onClick={() => setModal("food")}
                    >
                      Adicionar refeição
                    </button>
                  </div>
                ) : (
                  <div className="card">
                    {[...foods, ...workouts].map((i, n) => (
                      <p key={n}>
                        {i.name} <strong>{i.kcal} kcal</strong>
                      </p>
                    ))}
                  </div>
                )}
              </>
            )}
            {tab === "Progresso" && (
              <>
                <h1>Seu progresso</h1>
                <div className="empty">
                  <Mascot name="sport" />
                  <h3>Um passo de cada vez</h3>
                  <p>
                    Você fez {foods.length + workouts.length} registros nesta
                    sessão. O histórico de peso entra em uma próxima etapa.
                  </p>
                </div>
              </>
            )}
            {tab === "Conquistas" && (
              <Achievements
                streak={streak}
                foods={foods.length}
                workoutCalories={burned}
                history={achievementHistory}
              />
            )}
            {tab === "Perfil" && (
              <>
                <h1>Seu perfil</h1>
                <div className="card">
                  <h3>{profile.name || "Visitante"}</h3>
                  <p>Objetivo: {goal}</p>
                  <p>Atividade: {profile.activity || "Não informada"}</p>
                  <p>
                    Meta demonstrativa: {target.toLocaleString("pt-BR")} kcal
                  </p>
                  <button
                    className="outline"
                    onClick={() => {
                      setPlanStep(3);
                      go("plan");
                    }}
                  >
                    Ajustar meu ritmo
                  </button>
                </div>
                <button
                  className="text-button"
                  onClick={() => {
                    setProfile(initial);
                    setSkippedMeasures([]);
                    setStreak(0);
                    setAchievementHistory({ days: 0, meals: 0, burned: 0 });
                    setFoods([]);
                    setWorkouts([]);
                    setRate(0.55);
                    setLoginEmail("");
                    setLoginPassword("");
                    go("welcome");
                  }}
                >
                  <LogOut size={16} /> Sair e limpar demonstração
                </button>
              </>
            )}
            <p className="demo-note">
              Dados desta sessão · Sem gravação de conta ou senha
            </p>
            <nav className="bottom-nav" aria-label="Navegação principal">
              {[
                [Home, "Home"],
                [BookOpen, "Diário"],
                [TrendingUp, "Progresso"],
                [Trophy, "Conquistas"],
                [User, "Perfil"],
              ].map(([Icon, label]) => {
                const I = Icon as typeof Home;
                return (
                  <button
                    key={String(label)}
                    className={tab === label ? "active" : ""}
                    aria-current={tab === label ? "page" : undefined}
                    onClick={() => setTab(String(label))}
                  >
                    <I size={21} />
                    <span>{String(label)}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        )}
        {modal && (
          <Modal
            kind={modal}
            close={() => setModal("")}
            add={(item) => {
              modal === "food"
                ? (setFoods((a) => [...a, item]),
                  setStreak((s) => Math.max(s, 1)))
                : setWorkouts((a) => [...a, item]);
              setModal("");
            }}
          />
        )}
      </main>
    </div>
  );
}
function Modal({
  kind,
  close,
  add,
}: {
  kind: string;
  close: () => void;
  add: (i: { name: string; kcal: number }) => void;
}) {
  const [name, setName] = useState(""),
    [kcal, setKcal] = useState("");
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    ref.current?.focus();
    const f = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "Tab") {
        const els = ref.current?.querySelectorAll<HTMLElement>("button,input");
        if (!els?.length) return;
        const first = els[0],
          last = els[els.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", f);
    return () => {
      document.removeEventListener("keydown", f);
      previous?.focus();
    };
  }, []);
  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        ref={ref}
      >
        <button className="icon close" aria-label="Fechar" onClick={close}>
          <X />
        </button>
        <h2 id="modal-title">
          {kind === "notifications"
            ? "Suas notificações"
            : kind === "food"
              ? "Adicionar alimento"
              : "Adicionar atividade"}
        </h2>
        {kind === "notifications" ? (
          <p>
            Nenhuma notificação por enquanto. Seus próximos passos aparecem
            aqui.
          </p>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (name.trim() && Number(kcal) > 0 && Number(kcal) <= 10000)
                add({ name: name.trim(), kcal: Number(kcal) });
            }}
          >
            <p className="subtitle">
              Registro demonstrativo. Informe um valor de exemplo.
            </p>
            <label className="field">
              <span>
                {kind === "food" ? "Alimento ou refeição" : "Atividade"}
              </span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={80}
              />
            </label>
            <label className="field">
              <span>Energia (kcal)</span>
              <input
                type="number"
                min="1"
                max="10000"
                step="1"
                value={kcal}
                onChange={(e) => setKcal(e.target.value)}
                required
              />
            </label>
            <button className="primary">Adicionar registro</button>
          </form>
        )}
      </div>
    </div>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
