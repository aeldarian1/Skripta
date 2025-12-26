-- Create bot users and generate their content in one go
-- This combines create_bot_users.sql and create_bot_content.sql
-- Run this in Supabase SQL Editor with service role privileges
-- Bot users will have emails: bot1@example.com, bot2@example.com, etc.
-- Password for all bots: BotPassword123!

DO $$
DECLARE
  i INTEGER;
  new_user_id UUID;
  bot_user RECORD;
  topic_id UUID;
  num_topics INTEGER;
  num_replies INTEGER;
  random_category RECORD;
  random_faculty RECORD;
  random_topic_id UUID;
  topic_title TEXT;
  topic_content TEXT;

  -- Croatian/Serbian first names
  first_names TEXT[] := ARRAY[
    'Marko', 'Ana', 'Ivan', 'Petra', 'Luka', 'Maja', 'Mateo', 'Iva',
    'Filip', 'Lucija', 'Josip', 'Sara', 'Tomislav', 'Mia', 'Ante',
    'Elena', 'Nikola', 'Katarina', 'Petar', 'Gabriela', 'Jakov', 'Laura',
    'Dominik', 'Ema', 'David', 'Marta', 'Dario', 'Sofia', 'Martin',
    'Helena', 'Andrija', 'Lana', 'Lovro', 'Nina', 'Tin', 'Matea',
    'Karlo', 'Ela', 'Leon', 'Tea', 'Bruno', 'Nika', 'Roko', 'Hana',
    'Noa', 'Klara', 'Niko', 'Tena', 'Antonio', 'Ana', 'Mihael', 'Nika',
    'Fran', 'Leona', 'Jan', 'Lea', 'Vito', 'Paula', 'Jure', 'Iris'
  ];

  -- Croatian/Serbian last names
  last_names TEXT[] := ARRAY[
    'Horvat', 'Kovačević', 'Babić', 'Marić', 'Novak', 'Jurić', 'Knežević',
    'Matić', 'Pavlović', 'Tomić', 'Petrović', 'Božić', 'Šimić', 'Vuković',
    'Lovrić', 'Nikolić', 'Perić', 'Dujmović', 'Marković', 'Filipović',
    'Cvitković', 'Bošnjak', 'Radić', 'Barić', 'Klarić', 'Pavić', 'Banić',
    'Milić', 'Vidović', 'Jovanović', 'Stanković', 'Popović', 'Antić',
    'Jurković', 'Lukić', 'Kolar', 'Maričić', 'Šarić', 'Marinković',
    'Brajković', 'Galić', 'Jozić', 'Medić', 'Blažević', 'Mihaljević'
  ];

  -- Course/subject names
  subjects TEXT[] := ARRAY[
    'Matematika 1', 'Matematika 2', 'Fizika', 'Programiranje', 'Algoritmi',
    'Baze podataka', 'Web dizajn', 'Ekonomija', 'Računovodstvo', 'Marketing',
    'Organizacija', 'Statistika', 'Diskretna matematika', 'Linearna algebra',
    'OOP', 'Strukture podataka', 'Operacijski sustavi', 'Mreže', 'Signali',
    'Elektronika', 'Automatika', 'Engleski jezik', 'Pravo', 'Filozofija',
    'Kemija', 'Logika', 'Mikroekonomija', 'Makroekonomija', 'UI/UX',
    'Machine Learning', 'Kriptografija', 'Sigurnost', 'Grafika'
  ];

  -- Professor names/nicknames (mix of formal names and student nicknames/inappropriate)
  professors TEXT[] := ARRAY[
    'prof. Horvat', 'prof. Marić', 'doc. Kovač', 'prof. Babić',
    'Matić', 'dr. Jurić', 'Novak', 'doc. Tomić',
    'Stari', 'Strogi', 'Dragi', 'Boss', 'Šef',
    'Mumlja', 'Brzinski', 'Spori', 'Teski', 'Ludi prof',
    'Dugi', 'Ćelavi', 'Brki', 'Naočale', 'Zli',
    'Dosadni', 'Komplicirani', 'Car', 'Legenda', 'Masa',
    'Frajer', 'Kralj', 'Demon', 'Ubojica', 'Sadist',
    'Prof X', 'Dobri', 'Ludak', 'Ninja', 'Bog'
  ];

  -- Topic titles for different categories (natural, colloquial Croatian - mixed case)
  topic_titles TEXT[] := ARRAY[
    'kako se vi prijavljujete na ispit?',
    'Preporuke za prvu godinu?',
    'jel ima ko iskustva s profesorima ovdje?',
    'Pomoć za kolokvij molim 😅',
    'Koji prog jezik za pocetak??',
    'trazi se cimer/cimerica za stan blizu faksa',
    'Praksa - jel vrijedi?',
    'di ucite po gradu? najbolji kafici',
    'Kako se nosite sa stresom tokom ispitnog',
    'Ljetna praksa - vaša iskustva',
    'e-learning opet ne radi 🙄',
    'Koje stipendije preporucate',
    'raspored ispita - sta mislite?',
    'Di jefitno jest oko faksa',
    'imate li kakav hobi dok studirate',
    'Savjeti za diplomski',
    'Online resursi za ucenje - linkovi?',
    'Erasmus iskustva? vridi li?',
    'preporuke za online kurseve',
    'Ima li gaming ekipa na faksu? 🎮',
    'kak organizirate biljeske',
    'Koji su najbolji profesori',
    'teski ispiti - kako se spremit',
    'Studentski posao preporuke',
    'knjige za studij - što kupiti',
    'ucenje tokom semestra ili sve pred ispit lol',
    'Dodiplomski vs diplomski - razlike?',
    'kolko vremena trosiste na ucenje dnevno',
    'Iskustva s grupnim radom',
    'motivacija - kako ju odrzat',
    'Najbolje aplikacije za studente',
    'jel netko zna kad su upisi',
    'Smjerovi - pomoc pri odabiru',
    'kolko para vam treba mjesečno',
    'Preporuke za prijevoz do faksa',
    'kolege iz [predmet] - formirajmo grupu',
    'Jel ide netko na predavanja redovno',
    'di nabavit skripte',
    'Imam pitanje o prijavi ispita',
    'share-am biljeske iz [predmet]',
    'Gdje naći stare rokove?',
    'jel neko ima materijale za [predmet]',
    'Konzultacije - jel ima smisla ici',
    'kako balansirate faks i posao',
    'Kolko dugo vam treba da naucite za ispit',
    'jel vrijedi ici na vježbe',
    'Preporuke za master studij',
    'stanovanje - di trazit',
    'Kako zapocet s ucenjem',
    'jel neko bio na ljetnoj skoli',
    'Predavanja vs ucenje sam',
    'kolko cesto idete na faks',
    'Koju literaturu koristite',
    'jel ima ekipa za ucenje',
    'Di radite projektne zadatke',
    'laptop za studij - preporuke',
    'Kako se prijavit za praksu',
    'jel vrijedi upisat izborni',
    'Pitanja o upisu',
    'kako pisete seminar',
    'Kolko strogo profesori ocjenjuju',
    'jel ima ko za kolokvirat zajedno',
    'Savjeti za prezentaciju',
    'di nabavit jeftine knjige',
    'Kako organizirat učenje',
    'jel ima ko conectiona za posao',
    'Prijevoz do kampusa',
    'kako proc ispit kod [profesor]',
    'Jel neko ima pitanja s prošlih ispita',
    'di best mjesta za socijalizaciju',
    'Kako funkcionira ECTS',
    'jel se isplati upisati vise kolegija',
    'Preporuke za tečajeve',
    'kolko kolegija imate ovaj semestar',
    'Sta mislite o online nastavi',
    'jel ide ko na studentske dogadjaje',
    'Kako se snaci prva godina',
    'di nabavit menzu',
    'Jel vrijedi ic na guest predavanja',
    'kako uspjeti zavrsit na vrijeme'
  ];

  -- Reply content templates (natural, colloquial Croatian with typos and emojis - mixed case)
  reply_templates TEXT[] := ARRAY[
    'slazem se, isto iskustvo',
    'Probaj pitat studentsku sluzbu, oni znaju',
    'ja sam imao drugacije iskustvo al ok',
    'Hvala puno! ovo mi bas pomaze',
    'imas li vise detalja?',
    'Provjeri na stranicama faksa',
    'korisno, hvala sto si podjelio 👍',
    'Ja sam to rijesio tak da sam...',
    'mozda pitaj na fb grupi?',
    'Zanimljivo, i mene zanima',
    'moje iskustvo totalno suprotno lol',
    'Definitivno probaj!',
    'ja bi bio oprezan s tim',
    'Ima li neko novije info',
    'super savjet thx',
    'Dobar pristup',
    'probao sam i radi odlicno',
    'Mozda ima i bolji nacin al ovo je ok',
    'pitaj profesora, oni najbolje znaju',
    'Probaj i javi kako je bilo',
    'i mene ovo zanima!',
    'Kod mene bilo malo drugacije',
    'ovisi od faksa do faksa',
    'Dobar savjet za sve',
    'nisam znao za ovo, hvala',
    'Moram probat',
    'kod nas na faksu to ide ovak...',
    'Pitao profesora, rekao je da...',
    'odi na konzultacije definitivno',
    'Ovo bi moglo bit korisno svima',
    '+1 za ovo',
    'same',
    'this 💯',
    'bukvalno',
    'facts',
    'Kod mene radi',
    'ne znam tbh',
    'Nema sanse haha',
    'moze, pm me',
    'Imam iste probleme',
    'jesi našao rješenje?',
    'Javi se u dm',
    'updateaj nas molim',
    'remindme za ovo',
    'bump',
    'Takodje me zanima',
    'jos neko?',
    'x2',
    'ovo je gold 🔥',
    'Legend, hvala',
    'preach',
    'Big brain moment',
    'uf baš loše',
    'rip 😢',
    'f u chatu',
    'based',
    'No cap',
    'frfr',
    'lowkey dobar savjet',
    'Highkey se slažem',
    'tocno to',
    'Ma da, slazem se',
    'nope',
    'Yep, isto',
    'bruh',
    'Solidno objašnjenje',
    'jebeno, hvala',
    'Respect',
    'mood',
    'Ma nemoj',
    'svaka cast',
    'Doslovno',
    'fair point',
    'Ma ne znam',
    'Možda',
    'sigma savjet 💪',
    'Underrated comment',
    'real talk',
    'Big facts',
    'ne lažeš',
    'Straight facts',
    'ma kakvi',
    'Najbolji odgovor do sad',
    'noted',
    'Tnx brate/seka'
  ];

  -- Topic content templates (natural, casual, with typos and emojis - mixed case)
  content_templates TEXT[] := ARRAY[
    'zanima me vase misljenje, kako vi to radite?',
    'Trebam pomoc oko ovog. ima li neko slicna iskustva?',
    'sta mislite? bilo bi super cut razlicita misljenja',
    'Trebam savjet - kako ste vi to rijesili',
    'zna li neko nesto vise o ovome',
    'Razmisljam o ovom vec neko vrime. sta vi mislite?',
    'molim vas za pomoc 🙏 imate kakvih prijedloga?',
    'Bilo bi dobro cut vasa iskustva',
    'trebam vase savjete pls',
    'Kako vi pristupate ovome?',
    'jel ima ko iskustva s ovim?',
    'Dajte neki savjet molim vas',
    'help needed 😅',
    'Ne znam kako dalje, savjeti?',
    'jel neko zna odgovor na ovo',
    'Sta vi mislite, vridi li?',
    'pomozite plss',
    'Ima li ko ideju?',
    'ne kuzim ovo bas, objasnjenje?',
    'Dajte mi vasa misljenja',
    'kako to funkcionira kod vas',
    'Jel ovo normalno ili',
    'trebam input od nekoga tko zna',
    'Ozbiljno pitanje - kako rijesit ovo',
    'di sam tu fulao? 🤔',
    'Confused sam totalno',
    'jel neko prolazio kroz ovo',
    'Share-ajte iskustva molim',
    'update: jos uvijek ne znam sta radim lol',
    'Opcije? misljenja? bilo sta?',
    'Molim vas za savjet',
    'imate li preporuke',
    'Help 🙏',
    'Kako to radite vi',
    'jel neko zna',
    'Dajte linkove ako imate',
    'trebam vaše mišljenje o ovome',
    'Što radite u ovoj situaciji',
    'jel sam ja lud ili',
    'Ima li smisla ovo',
    'kakva su vasa iskustva',
    'Jel zna neko',
    'plssss help',
    'Bilo bi super da neko objasni',
    'ne kontam',
    'Jel moguće da',
    'kako vi gledate na ovo',
    'Trebao bi me neko uputit',
    'daj info pls',
    'Kakvi su rezultati kod vas'
  ];

BEGIN
  RAISE NOTICE 'Starting bot user creation...';

  -- STEP 1: Create 60 bot users
  FOR i IN 1..60 LOOP
    new_user_id := uuid_generate_v4();

    -- Get a random faculty for this bot
    SELECT f.id, f.name, u.name as university_name, u.slug as university_slug
    INTO random_faculty
    FROM faculties f
    JOIN universities u ON f.university_id = u.id
    ORDER BY random()
    LIMIT 1;

    -- Insert into auth.users (trigger will auto-create profile)
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      aud,
      role
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'bot' || i || '@example.com',
      crypt('BotPassword123!', gen_salt('bf')),
      now(),
      now(),
      now(),
      'authenticated',
      'authenticated'
    );

    -- Update the auto-created profile with Croatian/Serbian name and faculty info
    UPDATE profiles
    SET
      username = 'bot_user_' || i,
      full_name = first_names[1 + floor(random() * array_length(first_names, 1))] || ' ' ||
                  last_names[1 + floor(random() * array_length(last_names, 1))],
      bio = 'This is a test bot user for development purposes',
      reputation = floor(random() * 100),
      university = random_faculty.university_name,
      study_program = random_faculty.name
    WHERE id = new_user_id;
  END LOOP;

  RAISE NOTICE '60 bot users created successfully!';
  RAISE NOTICE 'Starting content generation...';

  -- STEP 2: Create random topics (each bot creates 1-4 topics)
  FOR bot_user IN (SELECT id FROM profiles WHERE email LIKE 'bot%@example.com') LOOP
    num_topics := 1 + floor(random() * 4); -- 1 to 4 topics per bot

    FOR i IN 1..num_topics LOOP
      -- Get random faculty and one of its categories
      SELECT c.id as category_id, c.faculty_id, f.slug as faculty_slug, u.slug as university_slug
      INTO random_category
      FROM categories c
      JOIN faculties f ON c.faculty_id = f.id
      JOIN universities u ON f.university_id = u.id
      WHERE c.faculty_id IS NOT NULL
      ORDER BY random()
      LIMIT 1;

      -- Generate topic
      topic_id := uuid_generate_v4();

      -- Get random title and content
      topic_title := topic_titles[1 + floor(random() * array_length(topic_titles, 1))];
      topic_content := content_templates[1 + floor(random() * array_length(content_templates, 1))];

      -- Replace [predmet] with random subject
      topic_title := replace(topic_title, '[predmet]', subjects[1 + floor(random() * array_length(subjects, 1))]);
      topic_content := replace(topic_content, '[predmet]', subjects[1 + floor(random() * array_length(subjects, 1))]);

      -- Replace [profesor] with random professor
      topic_title := replace(topic_title, '[profesor]', professors[1 + floor(random() * array_length(professors, 1))]);
      topic_content := replace(topic_content, '[profesor]', professors[1 + floor(random() * array_length(professors, 1))]);

      INSERT INTO topics (
        id,
        title,
        slug,
        content,
        author_id,
        category_id,
        faculty_id,
        view_count,
        created_at
      ) VALUES (
        topic_id,
        topic_title,
        substring(topic_id::text from 1 for 8),
        topic_content,
        bot_user.id,
        random_category.category_id,
        random_category.faculty_id,
        floor(random() * 100), -- random view count
        now() - (random() * interval '30 days') -- created within last 30 days
      );
    END LOOP;
  END LOOP;

  RAISE NOTICE 'Topics created successfully!';

  -- STEP 3: Create random replies (each bot creates 3-10 replies on random topics)
  FOR bot_user IN (SELECT id FROM profiles WHERE email LIKE 'bot%@example.com') LOOP
    num_replies := 3 + floor(random() * 8); -- 3 to 10 replies per bot

    FOR i IN 1..num_replies LOOP
      -- Get random topic
      SELECT id INTO random_topic_id
      FROM topics
      WHERE faculty_id IS NOT NULL -- Only topics under faculties
      ORDER BY random()
      LIMIT 1;

      -- Skip if no topics exist
      CONTINUE WHEN random_topic_id IS NULL;

      -- Generate reply
      INSERT INTO replies (
        content,
        author_id,
        topic_id,
        created_at
      ) VALUES (
        reply_templates[1 + floor(random() * array_length(reply_templates, 1))],
        bot_user.id,
        random_topic_id,
        now() - (random() * interval '29 days') -- created within last 29 days
      );
    END LOOP;
  END LOOP;

  RAISE NOTICE 'Replies created successfully!';

  -- STEP 4: Create realistic votes on replies with natural distribution
  FOR bot_user IN (SELECT id FROM profiles WHERE email LIKE 'bot%@example.com') LOOP
    -- Each bot votes on 5-15 random replies
    FOR i IN 1..(5 + floor(random() * 11)) LOOP
      DECLARE
        vote_chance FLOAT := random();
        vote_value INT;
      BEGIN
        -- Realistic voting distribution:
        -- 85% upvotes (most helpful replies get upvoted)
        -- 15% downvotes (unhelpful/wrong replies get downvoted)
        IF vote_chance < 0.85 THEN
          vote_value := 1; -- Upvote
        ELSE
          vote_value := -1; -- Downvote
        END IF;

        INSERT INTO votes (
          user_id,
          reply_id,
          vote_type
        )
        SELECT
          bot_user.id,
          replies.id,
          vote_value
        FROM replies
        WHERE replies.author_id != bot_user.id -- Don't vote on own replies
        ORDER BY random()
        LIMIT 1
        ON CONFLICT (user_id, reply_id) DO NOTHING; -- Skip if already voted
      END;
    END LOOP;
  END LOOP;

  RAISE NOTICE 'Votes created successfully!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Bot creation complete!';
  RAISE NOTICE 'Created 60 bot users with content';
  RAISE NOTICE 'Topics are distributed across all universities and faculties';
  RAISE NOTICE '========================================';
END $$;
