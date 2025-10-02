import React from "react";

export default function Home() {
  return (
    <main className="snap-y snap-mandatory h-screen overflow-y-scroll">
      {/* Section 1: Hero */}
      <section
        className="h-screen flex flex-col justify-center bg-background text-white snap-start p-52"
        id="hero"
      >
        <div>
          <h1 className="text-9xl font-bold mb-4">Hi, I am Louie Hansen</h1>
          <p className="text-6xl font-medium">Student, Developer, Creator</p>
        </div>
      </section>

      {/* Section 2: Blog & Projects */}
      <section
        className="h-screen flex flex-col justify-center items-center bg-background snap-start"
        id="work"
      >
        <div className="max-w-3xl w-full px-6">
          <h2 className="text-4xl font-bold mb-8 text-center">
            Blog Posts & Projects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Blog Posts */}
            <div>
              <h3 className="text-2xl font-semibold mb-4">Blog Posts</h3>
              <ul className="space-y-2">
                <li className="bg-white p-4 rounded shadow">
                  <span className="font-bold">Coming soon!</span>
                </li>
              </ul>
            </div>
            {/* Projects */}
            <div>
              <h3 className="text-2xl font-semibold mb-4">Projects</h3>
              <ul className="space-y-2">
                <li className="bg-white p-4 rounded shadow">
                  <span className="font-bold">Coming soon!</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Contact */}
      <section
        className="h-screen flex flex-col justify-center items-center bg-background snap-start"
        id="contact"
      >
        <h2 className="text-4xl font-bold mb-8">How to Contact Me</h2>
        <ul className="space-y-4 text-lg">
          <li>
            <span className="font-semibold">Discord:</span> yourDiscord#1234
          </li>
          <li>
            <span className="font-semibold">Email:</span> your.email@example.com
          </li>
          <li>
            <span className="font-semibold">Instagram:</span> @yourinstagram
          </li>
        </ul>
      </section>
    </main>
  );
}