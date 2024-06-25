'use client';

import Image from 'next/image';

import * as Blog from '@/components/Blog/Blog';
import UnderlinedLink from '@/components/UnderlinedLink/UnderlinedLink';
import kellyCodeArchitectureSVG from '@/public/assets/blog/kelly-code-architecture.drawio.svg';

const publishedDate = new Date(2024, 6, 24);

export default function Page() {
  return (
    <Blog.Article>
      <Blog.Header>
        <Blog.Heading1>Fixing My Gif Generator For Whatsapp</Blog.Heading1>

        <Blog.Date date={publishedDate} />
      </Blog.Header>

      <Blog.Summary>
        <p>
          Avoid doing your own optimisation of frames and duplicate any static
          frames rather than extending their durations.
        </p>
      </Blog.Summary>

      <Blog.Section className="mb-[90vh]">
        <Blog.Heading2>Introduction</Blog.Heading2>
        <p>
          A while ago I created a GIF generator. Users could provide some text
          in a GET request and the API would respond with an animated GIF of
          Kelly Rowland reading their message on her phone.
        </p>
        <Image
          alt="Demonstration GIF of Kelly Rowland reading a message on her phone"
          src="/assets/blog/kelly-example-1.gif"
          width={480}
          height={360}
          unoptimized
        />
        <UnderlinedLink href="/kelly" newTab>
          You can give it a go here.
        </UnderlinedLink>
        <p>
          The API operated by overlaying the text over an image of her phone,
          converting that to a gif of length around 3 seconds, and then
          stitching it to a before and after gif.
        </p>

        <p>
          This was created as an API rather than on the frontend so that users
          could easily share the URL and post onto slack which would then load
          the image in the chat. Users could still download the images via their
          browsers and share on other apps that didn&apos;t support this
          functionality like whatsapp.
        </p>
        <p>
          However I found that whatsapp did not play ball well with the GIFs I
          was producing. The start would play out fine, and then there would be
          a flash of the frame with the user&apos;s text in it and then the end
          of the GIF.
        </p>
        <p>
          This was no good! The whole point was the funny messages people were
          sending.
        </p>
        <p>
          So I did what any good software engineer would do. I put it on my
          backlog.
        </p>
      </Blog.Section>

      <Blog.Section>
        <h2 className="uppercase font-bold text-2xl">
          Literally 5 years later
        </h2>
        <p>
          I wanted to send one of these GIFs to someone but it looked crap on
          whatsapp as per usual. I&apos;d recently moved the code for the API
          into a monorepo for this website using pnpm and thought it might be a
          good opportunity to tidy up the code, fix the issue, and then add
          another similar GIF generator I had in mind.
        </p>
        <p>
          I had guessed the problem lay with the way that whatsapp was
          optimising/compressing animated content on their servers. I would need
          to do some debugging to find out what exactly was going wrong, but
          before that I needed to deal with a little issue.
        </p>
        <Image
          alt="Email from AWS informing me that my lambda function is running on an unsupported version of NodeJS"
          src="/assets/blog/lambda-eol.png"
          width={881}
          height={687}
        />
      </Blog.Section>

      <Blog.Section>
        <h2 className="uppercase font-bold text-2xl">Updating My Setup</h2>
        <p>I was well behind on my NodeJS versions. Literally off the chart.</p>
        <Image
          alt="NodeJS release schedule"
          src="/assets/blog/node-lts-timeline.png"
          width={776}
          height={442}
        />
        <p>
          On such an old version of NodeJS I would not be able to update my
          lambda function, AWS would only support keeping the existing one
          running and any updates would require major version updates.
        </p>
        <p>
          I was also keen to rewrite the code from Javascript to Typescript to
          align with the rest of my codebase and practice lambda function
          deployment processes within a typescript monorepo.
        </p>
        <p>
          I&apos;d previously been using{' '}
          <UnderlinedLink href="https://www.serverless.com" newTab>
            serverless
          </UnderlinedLink>{' '}
          to deploy the lambda function for this. There was a little issue with
          my developer experience but I wanted to continue using this tooling to
          deploy my function. I decided to fix my dev experience as my first
          step.
        </p>
        <p>
          Previously I had a single handler file doing all the logic of my
          function. Serverless comes with commands to run functions locally, but
          with a GIF API endpoint I would be returning a huge base64 string to
          my terminal. This was not ideal.
        </p>
        <p>
          So I split my function out into handlers and services. These handlers
          would take an input, call the appropriate service, and then return the
          output appropriately. So I had a lambda handler that would take the
          http api gateway event, validate the input, call the gif service, and
          then return the GIF in base64 in the required format. And then an
          equivalent command line interface handler that would take a string,
          call the services and then store the GIF as a file on the local
          machine.
        </p>
        <Image src={kellyCodeArchitectureSVG} alt="Code architecture diagram" />
      </Blog.Section>

      {/* Developing a Solution */}
      <Blog.Section>
        <h2 className="uppercase font-bold text-2xl">Developing a Solution</h2>
        <p>Outline the steps taken to fix the issue.</p>
      </Blog.Section>

      {/* Implementation */}
      <Blog.Section>
        <h2 className="uppercase font-bold text-2xl">Implementation</h2>
        <p>Provide a detailed guide on how the solution was implemented.</p>
      </Blog.Section>

      {/* Testing and Results */}
      <Blog.Section>
        <h2 className="uppercase font-bold text-2xl">Testing and Results</h2>
        <p>Describe how the solution was tested and share the results.</p>
      </Blog.Section>

      {/* Conclusion */}
      <Blog.Section>
        <h2 className="uppercase font-bold text-2xl">Conclusion</h2>
        <p>
          Summarize the key points covered in the post and reflect on the
          process.
        </p>
      </Blog.Section>

      {/* Further Reading/References */}
      <Blog.Section>
        <h2 className="uppercase font-bold text-2xl">
          Further Reading/References
        </h2>
        <p>
          Provide links to additional resources and acknowledge any third-party
          libraries or tools used.
        </p>
      </Blog.Section>
    </Blog.Article>
  );
}
