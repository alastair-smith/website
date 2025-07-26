'use client';

import { useState } from 'react';

import NumberInput from '@/components/NumberInput/NumberInput';

export default function Page() {
  const [eggsPerYear, setEggsPerYear] = useState(200);
  const [chickenLaysPerYear, setChickenLaysPerYear] = useState(365);
  const [chickenLifespanYears, setChickenLifespanYears] = useState(5);
  const [chickensContributing, setChickensContributing] = useState(10000);
  const [yearsEatingEggs, setYearsEatingEggs] = useState(30);

  const totalEggsEaten = eggsPerYear * yearsEatingEggs;
  const totalUniqueChickens = Math.ceil(
    (chickensContributing * yearsEatingEggs) / chickenLifespanYears
  );
  // const probability = (totalUniqueChickens! / (totalUniqueChickens - totalEggsEaten)) / Math.pow(totalUniqueChickens, totalEggsEaten)

  return (
    <div>
      <section>
        <h1>Eggain</h1>
        <p>What are the odds you've eaten 2 eggs from the same chicken?</p>
        {totalEggsEaten}a{totalUniqueChickens}
      </section>

      <section>
        <h2>Customise</h2>
        <form className="flex flex-col">
          <label>
            Number of eggs you eat per year
            <NumberInput
              value={eggsPerYear.toString()}
              onChange={(event) => setEggsPerYear(Number(event.target.value))}
            />
          </label>

          <label>
            How many eggs does the average chicken lay per year?
            <NumberInput
              value={chickenLaysPerYear.toString()}
              onChange={(event) =>
                setChickenLaysPerYear(Number(event.target.value))
              }
            />
          </label>

          <label>
            How long does a chicken live?
            <NumberInput
              value={chickenLifespanYears.toString()}
              onChange={(event) =>
                setChickenLifespanYears(Number(event.target.value))
              }
            />
          </label>

          <label>
            How many chickens contribute to the eggs you buy at any time?
            <NumberInput
              value={chickensContributing.toString()}
              onChange={(event) =>
                setChickensContributing(Number(event.target.value))
              }
            />
          </label>

          <label>
            How many years have you been eating eggs?
            <NumberInput
              value={yearsEatingEggs.toString()}
              onChange={(event) =>
                setYearsEatingEggs(Number(event.target.value))
              }
            />
          </label>
        </form>
      </section>

      <section>
        <h2>Results</h2>
        <p>
          Per year the odds of you eating at least 2 eggs from the same chicken
          is: {} %
        </p>
        <p>Over {yearsEatingEggs} years:</p>
      </section>
    </div>
  );
}
