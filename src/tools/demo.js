import Fact from './fact'
import FactType from '../constant/FactType'

const facts = [
    {   
        stance: {label: 'support', score: 0.5},
        relevance: 0.5,
        fact: new Fact(
            FactType.TREND,
            [{
                "field": "GDP",
                "aggregate": "sum"
            }],
            [
                {
                    "field": "Country Name",
                    "value": "China"
                }
            ],
            ['Year'],
            [],
            "",
        ),
        description: "China's GDP to grow steadily between 2021 and 2023",
        table: {
            name: 'economy',
            data: {
                rows: [
                    {'Country Name': 'China', 'Year': 2023, 'GDP': 100, 'CPI': 10},
                    {'Country Name': 'China', 'Year': 2022, 'GDP': 80, 'CPI': 8},
                    {'Country Name': 'China', 'Year': 2021, 'GDP': 60, 'CPI': 6},
                    {'Country Name': 'USA', 'Year': 2023, 'GDP': 200, 'CPI': 20},
                    {'Country Name': 'USA', 'Year': 2022, 'GDP': 180, 'CPI': 18},
                    {'Country Name': 'USA', 'Year': 2021, 'GDP': 160, 'CPI': 16},
                ],
                columns: ['Country Name', 'Year', 'GDP', 'CPI'],
                schema:  [
                    {type: 'categorical', field: 'Country Name'},
                    {type: 'temporal', field: 'Year'},
                    {type: 'numerical', field: 'GDP'},
                    {type: 'numerical', field: 'CPI'},
                ]
            },
        },
        star: false, 
        chartName: '',
    },
    {
        stance: {label: 'support', score: 0.6},
        relevance: 1.0,
        fact: new Fact(
            FactType.ASSOCIATION,
            [{
                "field": "CPI",
                "aggregate": "maximum"
            },{
                "field": "GDP",
                "aggregate": "maximum"
            }],
            [
                {
                    "field": "Country Name",
                    "value": "USA"
                }
            ],
            ['Year'], // breakdown好像没有用, 但是必须要有
            [],
            "",
        ),
        description: "China's GDP to grow steadily between 2021 and 2023",
        table: {
            name: 'economy',
            data: {
                rows: [
                    {'Country Name': 'China', 'Year': 2023, 'GDP': 100, 'CPI': 10},
                    {'Country Name': 'China', 'Year': 2022, 'GDP': 80, 'CPI': 8},
                    {'Country Name': 'China', 'Year': 2021, 'GDP': 60, 'CPI': 6},
                    {'Country Name': 'USA', 'Year': 2023, 'GDP': 200, 'CPI': 20},
                    {'Country Name': 'USA', 'Year': 2022, 'GDP': 180, 'CPI': 18},
                    {'Country Name': 'USA', 'Year': 2021, 'GDP': 160, 'CPI': 16},
                ],
                columns: ['Country Name', 'Year', 'GDP', 'CPI'],
                schema:  [
                    {type: 'categorical', field: 'Country Name'},
                    {type: 'temporal', field: 'Year'},
                    {type: 'numerical', field: 'GDP'},
                    {type: 'numerical', field: 'CPI'},
                ]
            },
            schema: [
                {type: 'categorical', field: 'Country Name'},
                {type: 'temporal', field: 'Year'},
                {type: 'numerical', field: 'GDP'},
                {type: 'numerical', field: 'CPI'},
            ]
        },
        star: false
    },
    {
        stance: {label: 'support', score: 0.6},
        relevance: 0.3,
        fact: new Fact(
            FactType.CATEGORIZATION, 
            [],
            [
                {
                    "field": "Country Name",
                    "value": "USA"
                }
            ],
            ['Year'],
            [],
            "",
        ),
        description: "China's GDP to grow steadily between 2021 and 2023",
        table: {
            name: 'economy',
            data: {
                rows: [
                    {'Country Name': 'China', 'Year': 2023, 'GDP': 100, 'CPI': 10},
                    {'Country Name': 'China', 'Year': 2022, 'GDP': 80, 'CPI': 8},
                    {'Country Name': 'China', 'Year': 2021, 'GDP': 60, 'CPI': 6},
                    {'Country Name': 'USA', 'Year': 2023, 'GDP': 200, 'CPI': 20},
                    {'Country Name': 'USA', 'Year': 2022, 'GDP': 180, 'CPI': 18},
                    {'Country Name': 'USA', 'Year': 2021, 'GDP': 160, 'CPI': 16},
                ],
                columns: ['Country Name', 'Year', 'GDP', 'CPI'],
                schema:  [
                    {type: 'categorical', field: 'Country Name'},
                    {type: 'temporal', field: 'Year'},
                    {type: 'numerical', field: 'GDP'},
                    {type: 'numerical', field: 'CPI'},
                ]
            },
            schema: [
                {type: 'categorical', field: 'Country Name'},
                {type: 'temporal', field: 'Year'},
                {type: 'numerical', field: 'GDP'},
                {type: 'numerical', field: 'CPI'},
            ]
        }
    },
    {
        stance: {label: 'support', score: 0.6},
        relevance: 0.3,
        fact: new Fact(
            FactType.DIFFERENCE,
            [{
                "field": "CPI",
                "aggregate": "maximum"
            }],
            [
            ],
            ['Year'],
            [
                {
                    "field": "Year",
                    "value": "2023"
                },
                {
                    "field": "Year",
                    "value": "2022"
                }
            ],
            "",
        ),
        description: "China's GDP to grow steadily between 2021 and 2023",
        table: {
            name: 'economy',
            data: [
                {'Country Name': 'China', 'Year': 2023, 'GDP': 100, 'CPI': 10},
                {'Country Name': 'China', 'Year': 2022, 'GDP': 80, 'CPI': 8},
                {'Country Name': 'China', 'Year': 2021, 'GDP': 60, 'CPI': 6},
                {'Country Name': 'USA', 'Year': 2023, 'GDP': 200, 'CPI': 20},
                {'Country Name': 'USA', 'Year': 2022, 'GDP': 180, 'CPI': 18},
                {'Country Name': 'USA', 'Year': 2021, 'GDP': 160, 'CPI': 16},
            ],
            schema: [
                {type: 'categorical', field: 'Country Name'},
                {type: 'temporal', field: 'Year'},
                {type: 'numerical', field: 'GDP'},
                {type: 'numerical', field: 'CPI'},
            ]
        }
    },
    {
        stance: {label: 'support', score: 0.6},
        relevance: 0.3,
        fact: new Fact(
            FactType.DISTRIBUTION,
            [{
                "field": "GDP",
                "aggregate": "maximum"
            }],
            [
                {
                    "field": "Country Name",
                    "value": "USA"
                }
            ],
            ['Year'],
            [],
            "",
        ),
        description: "China's GDP to grow steadily between 2021 and 2023",
        table: {
            name: 'economy',
            data: [
                {'Country Name': 'China', 'Year': 2023, 'GDP': 100, 'CPI': 10},
                {'Country Name': 'China', 'Year': 2022, 'GDP': 80, 'CPI': 8},
                {'Country Name': 'China', 'Year': 2021, 'GDP': 60, 'CPI': 6},
                {'Country Name': 'USA', 'Year': 2023, 'GDP': 200, 'CPI': 20},
                {'Country Name': 'USA', 'Year': 2022, 'GDP': 180, 'CPI': 18},
                {'Country Name': 'USA', 'Year': 2021, 'GDP': 160, 'CPI': 16},
            ],
            schema: [
                {type: 'categorical', field: 'Country Name'},
                {type: 'temporal', field: 'Year'},
                {type: 'numerical', field: 'GDP'},
                {type: 'numerical', field: 'CPI'},
            ]
        }
    },
    {
        stance: {label: 'support', score: 0.6},
        relevance: 0.3,
        fact: new Fact(
            FactType.EXTREME,
            [{
                "field": "CPI",
                "aggregate": "none"
            }],
            [
                {
                    "field": "Country Name",
                    "value": "USA"
                }
            ],
            ['Year'],
            [],
            "",
        ),
        description: "China's GDP to grow steadily between 2021 and 2023",
        table: {
            name: 'economy',
            data: [
                {'Country Name': 'China', 'Year': 2023, 'GDP': 100, 'CPI': 10},
                {'Country Name': 'China', 'Year': 2022, 'GDP': 110, 'CPI': 12},
                {'Country Name': 'China', 'Year': 2021, 'GDP': 60, 'CPI': 6},
                {'Country Name': 'USA', 'Year': 2023, 'GDP': 200, 'CPI': 20},
                {'Country Name': 'USA', 'Year': 2022, 'GDP': 220, 'CPI': 24},
                {'Country Name': 'USA', 'Year': 2021, 'GDP': 160, 'CPI': 16},
            ],
            schema: [
                {type: 'categorical', field: 'Country Name'},
                {type: 'temporal', field: 'Year'},
                {type: 'numerical', field: 'GDP'},
                {type: 'numerical', field: 'CPI'},
            ]
        }
    },
    {
        stance: {label: 'support', score: 0.6},
        relevance: 0.3,
        fact: new Fact(
            FactType.OUTLIER,
            [{
                "field": "CPI",
                "aggregate": "maximum"
            }],
            [],
            ['Year'],
            [],
            "",
        ),
        description: "China's GDP to grow steadily between 2021 and 2023",
        table: {
            name: 'economy',
            data: [
                {'Country Name': 'China', 'Year': 2023, 'GDP': 100, 'CPI': 10},
                {'Country Name': 'China', 'Year': 2022, 'GDP': 80, 'CPI': 8},
                {'Country Name': 'China', 'Year': 2021, 'GDP': 60, 'CPI': 6},
                {'Country Name': 'USA', 'Year': 2024, 'GDP': 160, 'CPI': 20},
                {'Country Name': 'USA', 'Year': 2023, 'GDP': 200, 'CPI': 20},
                {'Country Name': 'USA', 'Year': 2022, 'GDP': 180, 'CPI': 30},
                {'Country Name': 'USA', 'Year': 2021, 'GDP': 160, 'CPI': 16},
                {'Country Name': 'USA', 'Year': 2020, 'GDP': 160, 'CPI': 16},
            ],
            schema: [
                {type: 'categorical', field: 'Country Name'},
                {type: 'temporal', field: 'Year'},
                {type: 'numerical', field: 'GDP'},
                {type: 'numerical', field: 'CPI'},
            ]
        }
    },
    {   
        stance: {label: 'support', score: 0.5},
        relevance: 0.4,
        fact: new Fact(
            FactType.PROPORTION,
            [{
                "field": "GDP",
                "aggregate": "none"
            }],
            [
                {
                    "field": "Country Name",
                    "value": "China"
                }
            ],
            ['Year'],
            [],
            "",
        ),
        description: "China's GDP to grow steadily between 2021 and 2023",
        table: {
            name: 'economy',
            data: [
                {'Country Name': 'China', 'Year': 2023, 'GDP': 100, 'CPI': 10},
                {'Country Name': 'China', 'Year': 2022, 'GDP': 80, 'CPI': 8},
                {'Country Name': 'China', 'Year': 2021, 'GDP': 60, 'CPI': 6},
                {'Country Name': 'USA', 'Year': 2023, 'GDP': 200, 'CPI': 20},
                {'Country Name': 'USA', 'Year': 2022, 'GDP': 180, 'CPI': 18},
                {'Country Name': 'USA', 'Year': 2021, 'GDP': 160, 'CPI': 16},
            ], 
            schema: [
                {type: 'categorical', field: 'Country Name'},
                {type: 'temporal', field: 'Year'},
                {type: 'numerical', field: 'GDP'},
                {type: 'numerical', field: 'CPI'},
            ]
        }
    },    {   
        stance: {label: 'support', score: 0.5},
        relevance: 0.4,
        fact: new Fact(
            FactType.RANK,
            [{
                "field": "GDP",
                "aggregate": "none"
            }],
            [
                {
                    "field": "Country Name",
                    "value": "China"
                }
            ],
            ['Year'],
            [],
            "",
        ),
        description: "China's GDP to grow steadily between 2021 and 2023",
        table: {
            name: 'economy',
            data: [
                {'Country Name': 'China', 'Year': 2023, 'GDP': 80, 'CPI': 10},
                {'Country Name': 'China', 'Year': 2022, 'GDP': 100, 'CPI': 8},
                {'Country Name': 'China', 'Year': 2021, 'GDP': 60, 'CPI': 6},
                {'Country Name': 'China', 'Year': 2020, 'GDP': 20, 'CPI': 6},
                {'Country Name': 'USA', 'Year': 2023, 'GDP': 200, 'CPI': 20},
                {'Country Name': 'USA', 'Year': 2022, 'GDP': 180, 'CPI': 18},
                {'Country Name': 'USA', 'Year': 2021, 'GDP': 160, 'CPI': 16},
            ], 
            schema: [
                {type: 'categorical', field: 'Country Name'},
                {type: 'temporal', field: 'Year'},
                {type: 'numerical', field: 'GDP'},
                {type: 'numerical', field: 'CPI'},
            ]
        }
    }, {   
        stance: {label: 'support', score: 0.5},
        relevance: 0.4,
        fact: new Fact(
            FactType.VALUE,
            [{
                "field": "GDP",
                "aggregate": "sum"
            }],
            [ {
                "field": "Country Name",
                "value": "China"
            }],
            ['Year'],
            [{
                "field": "Year",
                "value": "2023"
            }],
            "",
        ),
        description: "China's GDP to grow steadily between 2021 and 2023",
        table: {
            name: 'economy',
            data: [
                {'Country Name': 'China', 'Year': 2023, 'GDP': 100, 'CPI': 10},
                {'Country Name': 'China', 'Year': 2022, 'GDP': 80, 'CPI': 8},
                {'Country Name': 'China', 'Year': 2021, 'GDP': 60, 'CPI': 6},
                {'Country Name': 'USA', 'Year': 2023, 'GDP': 200, 'CPI': 20},
                {'Country Name': 'USA', 'Year': 2022, 'GDP': 180, 'CPI': 18},
                {'Country Name': 'USA', 'Year': 2021, 'GDP': 160, 'CPI': 16},
            ], 
            schema: [
                {type: 'categorical', field: 'Country Name'},
                {type: 'temporal', field: 'Year'},
                {type: 'numerical', field: 'GDP'},
                {type: 'numerical', field: 'CPI'},
            ]
        }
    },
]

export default facts