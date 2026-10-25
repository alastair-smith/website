import MemeGenerator from '@/components/MemeGenerator/MemeGenerator';

export default function Potter() {
  return (
    <div className="max-w-reading mx-medium mb-huge lg:mt-huge w-full flex-col flex">
      <MemeGenerator
        type="potter"
        title="Potter"
        initialText="Nice earmuffs potter, did your mum make them for you?"
        frameClassName="aspect-[48/27] bg-[url('/potter-placeholder.jpg')]"
      />
    </div>
  );
}
