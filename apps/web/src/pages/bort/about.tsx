import { Link } from 'react-router-dom';
import Title from '@/components/Title/Title';

export default function BortAbout() {
  return (
    <div className="max-w-reading mx-medium my-huge w-full flex-col flex">
      <Link to="/bort" className="flex items-center mb-medium">
        <svg
          aria-hidden="true"
          className="rotate-180 mr-tiny"
          xmlns="http://www.w3.org/2000/svg"
          height="1em"
          viewBox="0 0 448 512"
        >
          <path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z" />
        </svg>
        <span>Bort</span>
      </Link>

      <section className="mb-huge ease-in duration-300">
        <Title>Bort</Title>
        <div className="flex flex-col items-center my-large">
          <iframe
            src="https://www.youtube.com/embed/Au1He0_eCkw"
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full aspect-video focus-visible:outline-none"
          />
        </div>
      </section>
    </div>
  );
}
