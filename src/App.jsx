import { useState, useMemo, useEffect } from "react";

const CATEGORIAS_DESPESA = ["Moradia", "Alimentação", "Transporte", "Saúde", "Educação", "Lazer", "Vestuário", "Assinaturas", "Outros"];
const CATEGORIAS_RECEITA = ["Salário", "Freelance", "Investimentos", "Aluguel recebido", "Outros"];

const fmt = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const fmtDate = (d) => new Date(d + "T00:00:00").toLocaleDateString("pt-BR");

// ─── PERSISTÊNCIA ────────────────────────────────────────────────────
function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }, [key, value]);

  return [value, setValue];
}

const COLORS = {
  bg: "#0F1117", surface: "#1A1D27", card: "#21243A", border: "#2E3150",
  accent: "#6C63FF", accentLight: "#8B85FF", green: "#22C55E",
  red: "#F43F5E", yellow: "#F59E0B", text: "#E8E9F3", muted: "#7B7FA8",
};

function Badge({ color, children }) {
  const map = { verde: COLORS.green, vermelho: COLORS.red, amarelo: COLORS.yellow, roxo: COLORS.accent };
  const c = map[color] || color;
  return (
    <span style={{ background: c + "22", color: c, border: `1px solid ${c}44`, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>{children}</span>
  );
}

function Card({ children, style }) {
  return <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 20, ...style }}>{children}</div>;
}

function Input({ label, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {label && <label style={{ fontSize: 12, color: COLORS.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>{label}</label>}
      <input {...props} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "10px 14px", color: COLORS.text, fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box", ...(props.style || {}) }} />
    </div>
  );
}

function Select({ label, children, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {label && <label style={{ fontSize: 12, color: COLORS.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>{label}</label>}
      <select {...props} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "10px 14px", color: COLORS.text, fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box", cursor: "pointer" }}>{children}</select>
    </div>
  );
}

function Button({ children, variant = "primary", onClick, style }) {
  const vars = {
    primary: { background: COLORS.accent, color: "#fff" },
    ghost: { background: "transparent", color: COLORS.muted, border: `1px solid ${COLORS.border}` },
    danger: { background: COLORS.red + "22", color: COLORS.red, border: `1px solid ${COLORS.red}44` },
    success: { background: COLORS.green + "22", color: COLORS.green, border: `1px solid ${COLORS.green}44` },
  };
  return <button onClick={onClick} style={{ borderRadius: 10, padding: "10px 18px", fontWeight: 600, fontSize: 14, cursor: "pointer", border: "none", ...vars[variant], ...style }}>{children}</button>;
}

function ProgressBar({ value, max, color = COLORS.accent }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div style={{ background: COLORS.border, borderRadius: 99, height: 8, overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 99, transition: "width 0.5s ease" }} />
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000a", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 20, padding: 28, width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ color: COLORS.text, margin: 0, fontSize: 18 }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: COLORS.muted, fontSize: 22, cursor: "pointer" }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function FormTransacao({ onSave, onClose, tipo }) {
  const [form, setForm] = useState({ descricao: "", valor: "", categoria: "", data: new Date().toISOString().split("T")[0], tipo });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const cats = tipo === "despesa" ? CATEGORIAS_DESPESA : CATEGORIAS_RECEITA;

  const save = () => {
    if (!form.descricao || !form.valor || !form.categoria || !form.data) return alert("Preencha todos os campos.");
    onSave({ ...form, id: Date.now(), valor: parseFloat(form.valor) });
    onClose();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Input label="Descrição" value={form.descricao} onChange={e => set("descricao", e.target.value)} placeholder="Ex: Supermercado" />
      <Input label="Valor (R$)" type="number" value={form.valor} onChange={e => set("valor", e.target.value)} placeholder="0,00" min="0" step="0.01" />
      <Select label="Categoria" value={form.categoria} onChange={e => set("categoria", e.target.value)}>
        <option value="">Selecione...</option>
        {cats.map(c => <option key={c}>{c}</option>)}
      </Select>
      <Input label="Data" type="date" value={form.data} onChange={e => set("data", e.target.value)} />
      <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
        <Button variant="ghost" onClick={onClose} style={{ flex: 1 }}>Cancelar</Button>
        <Button onClick={save} style={{ flex: 1 }}>Salvar</Button>
      </div>
    </div>
  );
}

function FormParcelamento({ onSave, onClose }) {
  const [form, setForm] = useState({ descricao: "", valorTotal: "", parcelas: "", pago: 0, categoria: "Outros", dataInicio: new Date().toISOString().split("T")[0] });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = () => {
    if (!form.descricao || !form.valorTotal || !form.parcelas) return alert("Preencha todos os campos.");
    onSave({ ...form, id: Date.now(), valorTotal: parseFloat(form.valorTotal), parcelas: parseInt(form.parcelas), pago: parseInt(form.pago) || 0 });
    onClose();
  };

  const vp = form.valorTotal && form.parcelas ? (parseFloat(form.valorTotal) / parseInt(form.parcelas)).toFixed(2) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Input label="Descrição" value={form.descricao} onChange={e => set("descricao", e.target.value)} placeholder="Ex: Notebook 12x" />
      <Input label="Valor Total (R$)" type="number" value={form.valorTotal} onChange={e => set("valorTotal", e.target.value)} placeholder="0,00" min="0" step="0.01" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Input label="Total de Parcelas" type="number" value={form.parcelas} onChange={e => set("parcelas", e.target.value)} placeholder="12" min="1" />
        <Input label="Parcelas Pagas" type="number" value={form.pago} onChange={e => set("pago", e.target.value)} placeholder="0" min="0" />
      </div>
      <Select label="Categoria" value={form.categoria} onChange={e => set("categoria", e.target.value)}>
        {CATEGORIAS_DESPESA.map(c => <option key={c}>{c}</option>)}
      </Select>
      <Input label="Início do Parcelamento" type="date" value={form.dataInicio} onChange={e => set("dataInicio", e.target.value)} />
      {vp && (
        <div style={{ background: COLORS.accent + "11", border: `1px solid ${COLORS.accent}33`, borderRadius: 10, padding: "10px 14px", fontSize: 14, color: COLORS.accentLight }}>
          Parcela mensal: <strong>{fmt(parseFloat(vp))}</strong>
        </div>
      )}
      <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
        <Button variant="ghost" onClick={onClose} style={{ flex: 1 }}>Cancelar</Button>
        <Button onClick={save} style={{ flex: 1 }}>Salvar</Button>
      </div>
    </div>
  );
}

function Dashboard({ transacoes, parcelamentos }) {
  const receitas = transacoes.filter(t => t.tipo === "receita").reduce((s, t) => s + t.valor, 0);
  const despesas = transacoes.filter(t => t.tipo === "despesa").reduce((s, t) => s + t.valor, 0);
  const saldo = receitas - despesas;
  const parcelasRestantes = parcelamentos.reduce((s, p) => s + (p.valorTotal / p.parcelas) * (p.parcelas - p.pago), 0);
  const totalDividas = parcelamentos.reduce((s, p) => s + p.valorTotal, 0);
  const totalPago = parcelamentos.reduce((s, p) => s + (p.valorTotal / p.parcelas) * p.pago, 0);
  const endividamento = receitas > 0 ? ((despesas + parcelasRestantes / 12) / receitas) * 100 : 0;
  const corEndividamento = endividamento < 30 ? COLORS.green : endividamento < 60 ? COLORS.yellow : COLORS.red;
  const labelEndividamento = endividamento < 30 ? "Saudável" : endividamento < 60 ? "Atenção" : "Crítico";

  const porCategoria = useMemo(() => {
    const map = {};
    transacoes.filter(t => t.tipo === "despesa").forEach(t => { map[t.categoria] = (map[t.categoria] || 0) + t.valor; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [transacoes]);

  const mesAtual = new Date().toLocaleString("pt-BR", { month: "long", year: "numeric" });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ background: `linear-gradient(135deg, ${COLORS.accent}33 0%, ${COLORS.card} 60%)`, border: `1px solid ${COLORS.accent}44`, borderRadius: 20, padding: 28 }}>
        <p style={{ color: COLORS.muted, margin: "0 0 6px", fontSize: 13, textTransform: "uppercase", letterSpacing: 1 }}>Saldo disponível · {mesAtual}</p>
        <h1 style={{ color: saldo >= 0 ? COLORS.green : COLORS.red, margin: "0 0 20px", fontSize: 36, fontWeight: 800, letterSpacing: -1 }}>{fmt(saldo)}</h1>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <p style={{ color: COLORS.muted, margin: "0 0 4px", fontSize: 12 }}>↑ Receitas</p>
            <p style={{ color: COLORS.green, margin: 0, fontSize: 20, fontWeight: 700 }}>{fmt(receitas)}</p>
          </div>
          <div>
            <p style={{ color: COLORS.muted, margin: "0 0 4px", fontSize: 12 }}>↓ Despesas</p>
            <p style={{ color: COLORS.red, margin: 0, fontSize: 20, fontWeight: 700 }}>{fmt(despesas)}</p>
          </div>
        </div>
      </div>

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <p style={{ color: COLORS.text, margin: 0, fontWeight: 600 }}>Índice de Endividamento</p>
          <Badge color={endividamento < 30 ? "verde" : endividamento < 60 ? "amarelo" : "vermelho"}>{labelEndividamento}</Badge>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 32, fontWeight: 800, color: corEndividamento }}>{endividamento.toFixed(1)}%</span>
          <span style={{ color: COLORS.muted, fontSize: 13 }}>da sua renda comprometida</span>
        </div>
        <ProgressBar value={endividamento} max={100} color={corEndividamento} />
        <p style={{ color: COLORS.muted, fontSize: 12, margin: "10px 0 0" }}>Ideal: abaixo de 30% · Inclui despesas mensais + parcelas a pagar</p>
      </Card>

      {parcelamentos.length > 0 && (
        <Card>
          <p style={{ color: COLORS.text, margin: "0 0 14px", fontWeight: 600 }}>Parcelamentos em Aberto</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div style={{ background: COLORS.surface, borderRadius: 10, padding: 14 }}>
              <p style={{ color: COLORS.muted, margin: "0 0 4px", fontSize: 12 }}>Total de dívidas</p>
              <p style={{ color: COLORS.red, margin: 0, fontWeight: 700, fontSize: 18 }}>{fmt(totalDividas)}</p>
            </div>
            <div style={{ background: COLORS.surface, borderRadius: 10, padding: 14 }}>
              <p style={{ color: COLORS.muted, margin: "0 0 4px", fontSize: 12 }}>Restante a pagar</p>
              <p style={{ color: COLORS.yellow, margin: 0, fontWeight: 700, fontSize: 18 }}>{fmt(parcelasRestantes)}</p>
            </div>
          </div>
          <ProgressBar value={totalPago} max={totalDividas} color={COLORS.green} />
          <p style={{ color: COLORS.muted, fontSize: 12, margin: "8px 0 0" }}>{((totalPago / totalDividas) * 100 || 0).toFixed(1)}% quitado</p>
        </Card>
      )}

      {porCategoria.length > 0 && (
        <Card>
          <p style={{ color: COLORS.text, margin: "0 0 16px", fontWeight: 600 }}>Maiores Despesas por Categoria</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {porCategoria.map(([cat, val]) => (
              <div key={cat}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ color: COLORS.text, fontSize: 13 }}>{cat}</span>
                  <span style={{ color: COLORS.muted, fontSize: 13 }}>{fmt(val)}</span>
                </div>
                <ProgressBar value={val} max={porCategoria[0][1]} color={COLORS.accent} />
              </div>
            ))}
          </div>
        </Card>
      )}

      {transacoes.length === 0 && parcelamentos.length === 0 && (
        <div style={{ textAlign: "center", padding: 40 }}>
          <p style={{ fontSize: 40 }}>💰</p>
          <p style={{ color: COLORS.muted }}>Nenhum dado ainda. Adicione receitas e despesas para ver seu painel.</p>
        </div>
      )}
    </div>
  );
}

function Transacoes({ transacoes, onAdd, onDelete }) {
  const [filtro, setFiltro] = useState("todos");
  const filtered = transacoes.filter(t => filtro === "todos" || t.tipo === filtro).sort((a, b) => b.data.localeCompare(a.data));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 10 }}>
        <Button variant="success" onClick={() => onAdd("receita")} style={{ flex: 1, fontSize: 13 }}>+ Receita</Button>
        <Button variant="danger" onClick={() => onAdd("despesa")} style={{ flex: 1, fontSize: 13 }}>+ Despesa</Button>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {["todos", "receita", "despesa"].map(f => (
          <button key={f} onClick={() => setFiltro(f)} style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${filtro === f ? COLORS.accent : COLORS.border}`, background: filtro === f ? COLORS.accent + "22" : "transparent", color: filtro === f ? COLORS.accentLight : COLORS.muted, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
            {f === "todos" ? "Todos" : f === "receita" ? "Receitas" : "Despesas"}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <p style={{ color: COLORS.muted }}>Nenhuma transação encontrada.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(t => (
            <div key={t.id} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderLeft: `3px solid ${t.tipo === "receita" ? COLORS.green : COLORS.red}`, borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: COLORS.text, margin: "0 0 4px", fontWeight: 600, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.descricao}</p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Badge color={t.tipo === "receita" ? "verde" : "vermelho"}>{t.categoria}</Badge>
                  <span style={{ color: COLORS.muted, fontSize: 12 }}>{fmtDate(t.data)}</span>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ color: t.tipo === "receita" ? COLORS.green : COLORS.red, margin: "0 0 6px", fontWeight: 700, fontSize: 16 }}>
                  {t.tipo === "receita" ? "+" : "-"}{fmt(t.valor)}
                </p>
                <button onClick={() => onDelete(t.id)} style={{ background: "none", border: "none", color: COLORS.muted, cursor: "pointer", fontSize: 16 }}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Parcelamentos({ parcelamentos, onAdd, onDelete, onPagar }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Button onClick={onAdd} style={{ width: "100%" }}>+ Novo Parcelamento</Button>
      {parcelamentos.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <p style={{ fontSize: 36 }}>📋</p>
          <p style={{ color: COLORS.muted }}>Nenhum parcelamento cadastrado.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {parcelamentos.map(p => {
            const vp = p.valorTotal / p.parcelas;
            const restante = p.parcelas - p.pago;
            const pct = (p.pago / p.parcelas) * 100;
            const concluido = p.pago >= p.parcelas;
            return (
              <Card key={p.id} style={{ borderLeft: `3px solid ${concluido ? COLORS.green : COLORS.yellow}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <p style={{ color: COLORS.text, margin: "0 0 6px", fontWeight: 700, fontSize: 15 }}>{p.descricao}</p>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <Badge color={concluido ? "verde" : "amarelo"}>{concluido ? "Quitado" : `${restante}x restantes`}</Badge>
                      <Badge color="roxo">{p.categoria}</Badge>
                    </div>
                  </div>
                  <button onClick={() => onDelete(p.id)} style={{ background: "none", border: "none", color: COLORS.muted, cursor: "pointer", fontSize: 16 }}>🗑</button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
                  <div>
                    <p style={{ color: COLORS.muted, margin: "0 0 2px", fontSize: 11 }}>Total</p>
                    <p style={{ color: COLORS.text, margin: 0, fontWeight: 700 }}>{fmt(p.valorTotal)}</p>
                  </div>
                  <div>
                    <p style={{ color: COLORS.muted, margin: "0 0 2px", fontSize: 11 }}>Parcela</p>
                    <p style={{ color: COLORS.yellow, margin: 0, fontWeight: 700 }}>{fmt(vp)}</p>
                  </div>
                  <div>
                    <p style={{ color: COLORS.muted, margin: "0 0 2px", fontSize: 11 }}>Restante</p>
                    <p style={{ color: COLORS.red, margin: 0, fontWeight: 700 }}>{fmt(vp * restante)}</p>
                  </div>
                </div>
                <ProgressBar value={p.pago} max={p.parcelas} color={concluido ? COLORS.green : COLORS.accent} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                  <span style={{ color: COLORS.muted, fontSize: 12 }}>{p.pago}/{p.parcelas} parcelas pagas ({pct.toFixed(0)}%)</span>
                  {!concluido && <Button variant="success" onClick={() => onPagar(p.id)} style={{ fontSize: 12, padding: "6px 12px" }}>Pagar parcela</Button>}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [transacoes, setTransacoes] = useLocalStorage("finctr_transacoes", []);
  const [parcelamentos, setParcelamentos] = useLocalStorage("finctr_parcelamentos", []);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [modal, setModal] = useState(null);

  const addTransacao = (t) => setTransacoes(prev => [...prev, t]);
  const delTransacao = (id) => setTransacoes(prev => prev.filter(t => t.id !== id));
  const addParcelamento = (p) => setParcelamentos(prev => [...prev, p]);
  const delParcelamento = (id) => setParcelamentos(prev => prev.filter(p => p.id !== id));
  const pagarParcela = (id) => setParcelamentos(prev => prev.map(p => p.id === id ? { ...p, pago: Math.min(p.pago + 1, p.parcelas) } : p));

  const tabs = [
    { id: "dashboard", label: "Painel", icon: "📊" },
    { id: "transacoes", label: "Lançamentos", icon: "💸" },
    { id: "parcelamentos", label: "Parcelas", icon: "📋" },
  ];

  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif", color: COLORS.text }}>
      <div style={{ background: COLORS.surface, borderBottom: `1px solid ${COLORS.border}`, padding: "16px 20px", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 600, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: COLORS.text }}><span style={{ color: COLORS.accent }}>fin</span>ctrl</h1>
            <p style={{ margin: 0, fontSize: 11, color: COLORS.muted }}>Suas finanças sob controle</p>
          </div>
          <div style={{ background: COLORS.green + "22", color: COLORS.green, border: `1px solid ${COLORS.green}44`, borderRadius: 8, padding: "4px 10px", fontSize: 12, fontWeight: 600 }}>
            {transacoes.length} lançamentos
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "20px 16px 100px" }}>
        {activeTab === "dashboard" && <Dashboard transacoes={transacoes} parcelamentos={parcelamentos} />}
        {activeTab === "transacoes" && <Transacoes transacoes={transacoes} onAdd={(tipo) => setModal(tipo)} onDelete={delTransacao} />}
        {activeTab === "parcelamentos" && <Parcelamentos parcelamentos={parcelamentos} onAdd={() => setModal("parcelamento")} onDelete={delParcelamento} onPagar={pagarParcela} />}
      </div>

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: COLORS.surface, borderTop: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "center" }}>
        <div style={{ display: "flex", width: "100%", maxWidth: 600 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ flex: 1, padding: "12px 8px", background: "none", border: "none", cursor: "pointer", color: activeTab === t.id ? COLORS.accent : COLORS.muted, borderTop: `2px solid ${activeTab === t.id ? COLORS.accent : "transparent"}`, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
              <span style={{ fontSize: 18 }}>{t.icon}</span>
              <span style={{ fontSize: 11, fontWeight: 600 }}>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {modal === "receita" && <Modal title="Nova Receita" onClose={() => setModal(null)}><FormTransacao tipo="receita" onSave={addTransacao} onClose={() => setModal(null)} /></Modal>}
      {modal === "despesa" && <Modal title="Nova Despesa" onClose={() => setModal(null)}><FormTransacao tipo="despesa" onSave={addTransacao} onClose={() => setModal(null)} /></Modal>}
      {modal === "parcelamento" && <Modal title="Novo Parcelamento" onClose={() => setModal(null)}><FormParcelamento onSave={addParcelamento} onClose={() => setModal(null)} /></Modal>}
    </div>
  );
}
