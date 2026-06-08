import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

function AppLayout({ children }) {
  return (
    <div className="app-shell">
      <Sidebar />

      <main className="main-area">
        <Header />
        <section className="content-area">{children}</section>
      </main>
    </div>
  );
}

export default AppLayout;