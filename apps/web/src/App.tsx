import { Route, Routes } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import Bort from '@/pages/bort';
import BortAbout from '@/pages/bort/about';
import Kelly from '@/pages/kelly';
import KellyAbout from '@/pages/kelly/about';
import Potter from '@/pages/potter';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* the homepage is the two ribbons meeting in the middle, so it has no
            main content of its own */}
        <Route index element={null} />

        <Route path="/bort" element={<Bort />} />
        <Route path="/bort/about" element={<BortAbout />} />
        <Route path="/kelly" element={<Kelly />} />
        <Route path="/kelly/about" element={<KellyAbout />} />
        <Route path="/potter" element={<Potter />} />
      </Route>
    </Routes>
  );
}
