import { Route, Routes } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import Bort from '@/pages/bort';
import BortAbout from '@/pages/bort/about';
import Kelly from '@/pages/kelly';
import KellyAbout from '@/pages/kelly/about';
import NotFound from '@/pages/not-found';
import Potter from '@/pages/potter';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Homepage rendering owned by the layout */}
        <Route index element={null} />

        <Route path="/bort" element={<Bort />} />
        <Route path="/bort/about" element={<BortAbout />} />
        <Route path="/kelly" element={<Kelly />} />
        <Route path="/kelly/about" element={<KellyAbout />} />
        <Route path="/potter" element={<Potter />} />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
