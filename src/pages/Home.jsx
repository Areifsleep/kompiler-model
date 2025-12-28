import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";

const AUTHORS = {
  superTeam: "Kelompok 2",
  teams: [
    {
      teamName: "Kelompok 6 - Parsing",
      members: [
        { name: "ARIF RAHMAN", role: "23106050050" },
        { name: "ROZIN GUNAGRAHA", role: "23106050084" },
      ],
    },
    {
      teamName: "Kelompok 7 - Parsing",
      members: [
        { name: "AHMAD ZIDNI HIDAYAT", role: "23106050077" },
        { name: "SYAFIQ RUSTIAWANTO", role: "23106050094" },
      ],
    },
    {
      teamName: "Kelompok 9 - Visualization",
      members: [
        { name: "MUHAMMAD FAISAL RAMADHAN", role: "23106050061" },
        { name: "DAMA AMISUDA", role: "23106050096" },
      ],
    },
    {
      teamName: "Kelompok 10 - Translation",
      members: [
        { name: "IDHAN HAIDAR KURNIAWAN", role: "23106050054" },
        { name: "HANIF UBAIDUR ROHMAN SYAH", role: "23106050081" },
      ],
    },
  ],
};
export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Kompiler Model</h1>
          <p className="text-lg text-muted-foreground">Aplikasi untuk parsing, visualisasi, dan translasi model JSON</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate("/parsing")}
          >
            <CardHeader>
              <CardTitle>1. Parsing</CardTitle>
              <CardDescription>Input dan validasi JSON model</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Masukkan model JSON Anda dan validasi strukturnya</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate("/visualization")}
          >
            <CardHeader>
              <CardTitle>2. Visualisasi</CardTitle>
              <CardDescription>Diagram class dan relasi</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Lihat visualisasi class dan relationship dalam bentuk diagram</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate("/translation")}
          >
            <CardHeader>
              <CardTitle>3. Translasi</CardTitle>
              <CardDescription>Generate kode program</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Translasi model ke bahasa pemrograman Typescript</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Workflow</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Input JSON model dan validasi struktur</li>
              <li>Visualisasi class diagram dan relationship</li>
              <li>Translasi kode ke bahasa Typescript</li>
              <li>Download hasil translasi</li>
            </ol>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <Button
            size="lg"
            onClick={() => navigate("/parsing")}
          >
            Mulai Parsing
          </Button>
        </div>

        <div className="border" />

        <div className="mt-12 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-2">Super Team</div>
            <h2 className="text-3xl font-bold tracking-tight">Kelompok 2</h2>
            <p className="text-base text-muted-foreground">Tim Pengembang Kompiler Model</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {AUTHORS.teams.map((team) => (
              <Card
                key={team.teamName}
                className="border-2"
              >
                <CardHeader>
                  <CardTitle className="text-lg">{team.teamName}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {team.members.map((member) => (
                    <div
                      className="flex items-center gap-3"
                      key={member.name}
                    >
                      <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shadow-sm">
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <p className="font-semibold text-base">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
