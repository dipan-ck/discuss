import React from 'react';
import { MessageSquare, Hash, Users, Mic, Search, Server, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function Page() {
  const features = [
    {
      icon: Server,
      title: "Create & Join Servers",
      description: "Build your own communities or join existing ones instantly"
    },
    {
      icon: Hash,
      title: "Channel Management",
      description: "Organize conversations with unlimited text and voice channels"
    },
    {
      icon: Search,
      title: "Quick Search",
      description: "Find any channel or conversation in seconds"
    },
    {
      icon: MessageSquare,
      title: "Text Chat",
      description: "Real-time messaging with your friends and community"
    },
    {
      icon: Mic,
      title: "Voice Chat",
      description: "Crystal clear voice communication for all your needs"
    },
    {
      icon: Users,
      title: "Community First",
      description: "Connect with people who share your interests"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold">Discuss</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" asChild>
                <a
                  href="https://github.com/yourusername/discord-clone"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2"
                >
                  <Github className="w-4 h-4" />
                  <span className="hidden sm:inline">GitHub</span>
                </a>
              </Button>
              <Button asChild>
                <a href="/login">Get Started</a>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="text-center space-y-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
            Where Communities
            <br />
            <span className="text-primary">Come Together</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Create your space, invite your friends, and start conversations that matter. 
            Text, voice, and everything in between.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button size="lg" asChild>
              <a href="/login">Launch App</a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a
                href="https://github.com/yourusername/discord-clone"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2"
              >
                <Github className="w-5 h-5" />
                View Source
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Everything You Need</h2>
          <p className="text-lg text-muted-foreground">
            All the essential features to build and grow your community
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t">
        <Card className="bg-primary/5">
          <CardContent className="p-12 text-center space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of communities already using Discourse to connect, communicate, and collaborate.
            </p>
            <Button size="lg" asChild>
              <a href="/login">Create Your Server</a>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-primary" />
              <span className="font-semibold">Discourse</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Built with React & shadcn/ui
            </p>
            <Button variant="link" asChild>
              <a
                href="https://github.com/yourusername/discord-clone"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2"
              >
                <Github className="w-4 h-4" />
                View on GitHub
              </a>
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Page;