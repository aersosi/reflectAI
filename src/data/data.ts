export const data = [
    {
        sessionID: "12",
        sessionName: "Session 1"
    },    {
        sessionID: "34",
        sessionName: "Session 2"
    },
];


export const data2 = [
    {
        "id": "uuid-1234-abcd", // Eindeutige ID (wichtiger als eine laufende Nummer)
        "name": "Meine erste Analyse",
        "date": 1678886400000, // Unix Timestamp (Millisekunden!)
        "appState": {
            // Hier kommt der komplette Zustand deiner App für diese Session rein
            "userInput": "...",
            "calculationResults": [...],
            "chartOptions": {...},
            // ...alle anderen Werte, die gespeichert werden sollen
        }
    },
    {
        "id": "uuid-5678-efgh",
        "name": "Testlauf XYZ",
        "date": 1678887500000,
        "appState": {
            "userInput": "anderer Input",
            "calculationResults": [...],
            "chartOptions": {...},
            // ...
        }
    }
    // ... weitere Sessions
]