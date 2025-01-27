import Header from "../../components/user/Header";
import Landing from "../../components/user/Landing";

const Home = () => (
  <div className="min-h-screen flex flex-col bg-gray-50">
    {/* Header */}
    <Header />

    {/* Main Content */}
    <main className="flex flex-col">
      {/* Landing Section */}
      <Landing />
    </main>
  </div>
);

export default Home;
