import img_01 from "../../assets/image/blog-01.jpg";
import img_02 from "../../assets/image/blog-02.jpg";
import img_03 from "../../assets/image/blog-03.jpg";

export const createBlogSlug = (title) => {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
};

export const blogContent = [
    {
        id: "1",
        img: img_01,
        category: "Travel Guide",
        meta: "10 JUNE 2025",
        readTime: "6 min read",
        title: "A Calm Weekend Guide For A Beach Escape",
        excerpt: "Plan a relaxed coastal weekend with better timing, smarter packing, and simple photo stops that make the trip feel effortless.",
        designation_01: `A beach trip feels better when the pace is simple. Choose one main place to explore, keep your plan light, and leave enough room for slow mornings, food stops, and sunset walks.`,
        designation_02: `The best travel memories usually come from space in the schedule, not from trying to finish every attraction in one day.`,
        description_01: `Start with the weather, tide timing, and transport. If you arrive before noon, you can settle in, walk around the area, and save the golden hour for photos instead of rushing through check-in.`,
        description_02: `Pack light clothes, sandals, sunscreen, a power bank, and a small dry bag. Keep your camera or phone ready, but avoid carrying too much gear if you plan to walk near the water.`,
        description_03: `For photos, look for clean backgrounds, reflections, umbrellas, fishing boats, and people walking along the shore. Early morning and late afternoon light will make everything softer.`,
        description_04: `End the day with local food and a short walk. A simple plan like this keeps the trip peaceful and gives you enough moments to turn into a good story.`
    },
    {
        id: "2",
        img: img_02,
        category: "Photography",
        meta: "07 MAY 2025",
        readTime: "5 min read",
        title: "How To Capture Better Travel Photos",
        excerpt: "Use light, scale, and small local details to make travel photos feel more natural and memorable.",
        designation_01: `Travel photography is not only about famous spots. Small details, quiet alleys, local textures, and the way light falls on a place can tell a stronger story.`,
        designation_02: `Try to photograph the feeling of a place before you photograph the checklist version of it.`,
        description_01: `Begin with light. Morning light gives soft color, while evening light adds warmth and depth. Midday can still work if you look for shade, patterns, or strong contrast.`,
        description_02: `Add scale by including people, doors, trees, roads, or signs. These elements help viewers understand the size and mood of the location.`,
        description_03: `Take wide shots, medium shots, and close details. A complete travel story needs all three: where you were, what happened there, and what made it feel unique.`,
        description_04: `Edit lightly. Keep colors honest, straighten the frame, and let the place stay believable. Natural photos often feel more premium than over-edited ones.`
    },
    {
        id: "3",
        img: img_03,
        category: "City Walk",
        meta: "07 JULY 2025",
        readTime: "7 min read",
        title: "The Smart Way To Explore A New City",
        excerpt: "Build a city walk around neighborhoods, food stops, public transport, and a few flexible anchors instead of a packed checklist.",
        designation_01: `A new city becomes easier to understand when you explore it by neighborhood. Pick one area, walk slowly, and let cafes, markets, parks, and side streets shape the day.`,
        designation_02: `A good city walk balances direction with surprise. You need a route, but you also need permission to wander.`,
        description_01: `Start with one anchor place like a museum, station, viewpoint, or market. Then choose nearby streets and food stops instead of jumping across the city all day.`,
        description_02: `Use public transport when distances get long. It saves energy and gives you a better sense of how people actually move through the city.`,
        description_03: `Keep a short list of backup places in case of rain, crowds, or closures. Professional travel planning always leaves room for a plan B.`,
        description_04: `At the end, write quick notes about what surprised you. Those notes become stronger blog stories than generic descriptions copied from a map.`
    },
    {
        id: "4",
        img: img_01,
        category: "Nature",
        meta: "12 AUGUST 2025",
        readTime: "4 min read",
        title: "Simple Ways To Plan A Mountain Morning",
        excerpt: "Make a mountain trip smoother with early starts, warm layers, water, and a short route that leaves room for photos.",
        designation_01: `Mountain mornings are best when they start before the road gets busy. Keep the route simple and choose one viewpoint instead of chasing too many stops.`,
        designation_02: `The quieter the plan, the easier it is to notice the light, weather, and small details around you.`,
        description_01: `Check sunrise time, road conditions, and parking before you leave. Pack water, a light jacket, snacks, and a small first-aid pouch.`,
        description_02: `Choose a path that matches your energy. A short trail with a clear view is often better than a long route that leaves everyone tired.`,
        description_03: `For photos, look for layers of hills, mist, trees, and people walking into the frame. These details add scale and story.`,
        description_04: `Return before the afternoon heat if possible. You will enjoy the day more when the trip ends with energy still left.`
    },
    {
        id: "5",
        img: img_02,
        category: "Food Trip",
        meta: "18 AUGUST 2025",
        readTime: "5 min read",
        title: "How To Build A Small Food Walk",
        excerpt: "Turn a simple city walk into a better food story by choosing markets, snacks, cafes, and one local meal.",
        designation_01: `Food walks work best when you move slowly. Pick one area and let smells, queues, and small shops guide the route.`,
        designation_02: `A good food story is not only about taste. It is also about place, people, timing, and texture.`,
        description_01: `Start with a local market or busy street. Try one small snack first so the walk feels casual instead of heavy.`,
        description_02: `Mix sweet, savory, tea, and one full meal. This gives the day rhythm and keeps the experience balanced.`,
        description_03: `Take quick notes about price, flavor, service, and what made the place memorable. These notes make your blog more useful.`,
        description_04: `End with a cafe or dessert spot where you can rest and review photos before heading back.`
    },
    {
        id: "6",
        img: img_03,
        category: "Packing",
        meta: "24 AUGUST 2025",
        readTime: "6 min read",
        title: "A Better Packing List For Short Trips",
        excerpt: "Pack lighter without missing essentials by grouping your clothes, camera items, documents, and health basics.",
        designation_01: `Short trips become easier when the bag is simple. Pack for the actual plan, not every possible situation.`,
        designation_02: `The best packing list saves both space and attention, because you spend less time looking for things.`,
        description_01: `Start with clothes that can mix together. Two tops, one extra layer, and comfortable shoes cover most short routes.`,
        description_02: `Keep chargers, power bank, earphones, and camera cards in one pouch so they do not disappear inside the bag.`,
        description_03: `Carry a small health kit with basic medicine, bandage, sanitizer, and sunscreen. It takes little space but helps a lot.`,
        description_04: `Before leaving, remove one thing you packed out of fear. Most bags get better after one final edit.`
    },
    {
        id: "7",
        img: img_01,
        category: "Road Trip",
        meta: "02 SEPTEMBER 2025",
        readTime: "7 min read",
        title: "How To Keep A Road Trip Comfortable",
        excerpt: "Use better stop timing, playlists, snacks, route checks, and flexible plans to make a long drive feel easier.",
        designation_01: `A comfortable road trip is built around breaks. The road feels shorter when the day has good pauses.`,
        designation_02: `Do not plan every minute. Leave enough space for weather, traffic, and surprising views.`,
        description_01: `Check fuel, tire pressure, documents, and weather before leaving. A small check saves stress later.`,
        description_02: `Plan breaks every two or three hours. Use them for stretching, water, snacks, and quick photos.`,
        description_03: `Download maps and music before the trip. Network can disappear exactly when you need it most.`,
        description_04: `Keep the final destination flexible if possible. Sometimes the best stop is the one you did not plan.`
    },
    {
        id: "8",
        img: img_02,
        category: "Budget Travel",
        meta: "09 SEPTEMBER 2025",
        readTime: "5 min read",
        title: "Travel Better With A Small Budget",
        excerpt: "Spend smarter on transport, stays, food, and activities while still keeping the trip comfortable.",
        designation_01: `Budget travel does not mean removing joy. It means choosing what matters most and spending there first.`,
        designation_02: `The goal is not the cheapest trip. The goal is the best trip your budget can honestly support.`,
        description_01: `Book transport early when possible and compare timing, not only price. A cheaper ticket can cost energy later.`,
        description_02: `Choose stays near the area you want to explore. Saving money far away can become expensive in transport.`,
        description_03: `Eat local for most meals and save one special meal for the day you want to remember most.`,
        description_04: `Track small costs like taxis, snacks, and entry fees. They add up faster than big planned expenses.`
    },
    {
        id: "9",
        img: img_03,
        category: "Photo Story",
        meta: "16 SEPTEMBER 2025",
        readTime: "6 min read",
        title: "Create A Travel Story From Ten Photos",
        excerpt: "Choose ten stronger images that show place, people, movement, detail, and ending instead of posting everything.",
        designation_01: `A photo story becomes stronger when every image has a job. You do not need many photos, you need a clear flow.`,
        designation_02: `Think like a viewer. Show where you are, what happened, what changed, and how it ended.`,
        description_01: `Start with a wide image that sets the place. Then add movement, details, faces, food, and a quiet ending frame.`,
        description_02: `Avoid choosing photos that repeat the same information. Similar images weaken the story.`,
        description_03: `Edit the set together so color and brightness feel consistent. This makes the story look intentional.`,
        description_04: `Write one short caption for each image. Simple captions can carry the viewer through the journey.`
    }
];
