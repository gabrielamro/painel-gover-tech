import { Component, type ErrorInfo, type ReactNode } from 'react';

interface State { hasError: boolean }
export class AppErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError(): State { return { hasError: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('Falha não tratada no PainelPro React.', error, info); }
  render() {
    if (this.state.hasError) return <main className="react-error-state"><h1>Não foi possível abrir esta tela</h1><p>Os dados foram preservados. Recarregue a página para tentar novamente.</p><button onClick={() => location.reload()}>Recarregar</button></main>;
    return this.props.children;
  }
}
