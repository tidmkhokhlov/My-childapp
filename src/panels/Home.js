import {
  Panel,
  PanelHeader,
  Tabs,
  TabsItem,
  Group,
  Header,
  Card,
  SimpleCell,
  Avatar,
  Div,
  Checkbox,
  Button,
  ModalRoot,
  ModalPage,
  ModalPageHeader,
  View,
  PanelHeaderButton,
  platform,
} from "@vkontakte/vkui";
import { useState } from "react";
import PropTypes from "prop-types";
import { Icon24Dismiss, Icon28CancelOutline } from "@vkontakte/icons";

// Пример данных мероприятий
const events = {
  leisure: [
    {
      id: 1,
      title: "Мастер-класс по созданию свечей",
      description:
        "Освойте основы свечеварения и сделайте свечи своими руками!",
      date: "28 ноября",
      image: "https://via.placeholder.com/150/FFB6C1",
      category: "творчество",
    },
    {
      id: 2,
      title: "Фильм «Рукописи русских святых»",
      description:
        "Посмотрите видеофильм из коллекции Российской национальной библиотеки.",
      date: "28 ноября",
      image: "https://via.placeholder.com/150/ADD8E6",
      category: "история",
    },
  ],
  places: [
    {
      id: 3,
      title: "Экскурсия по Нижегородскому Кремлю",
      description: "Узнайте больше о шедеврах мирового искусства.",
      date: "29 ноября",
      image: "https://via.placeholder.com/150/90EE90",
      category: "культура",
    },
  ],
  development: [
    {
      id: 4,
      title: "Курс по программированию для начинающих",
      description: "Сделайте первый шаг в IT!",
      date: "30 ноября",
      image: "https://via.placeholder.com/150/FFFFE0",
      category: "образование",
    },
  ],
};

export const Home = ({ id }) => {
  const [activeTab, setActiveTab] = useState("leisure"); // Активная вкладка
  const [filters, setFilters] = useState({}); // Фильтры
  const [favorites, setFavorites] = useState([]); // Избранное
  const [showFavorites, setShowFavorites] = useState(false); // Показать только избранное
  const [activeEvent, setActiveEvent] = useState(null); // Активное событие (для модалки)
  const currentPlatform = platform(); // Определяем платформу

  // Обработка избранного
  const toggleFavorite = (eventId) => {
    setFavorites((prevFavorites) =>
      prevFavorites.includes(eventId)
        ? prevFavorites.filter((id) => id !== eventId)
        : [...prevFavorites, eventId]
    );
  };

  // Применение фильтров
  const filteredEvents = events[activeTab].filter((event) => {
    const isFavorite = favorites.includes(event.id);
    const matchesFilters = Object.entries(filters).every(
      ([key, value]) => !value || event.category === key
    );
    return (!showFavorites || isFavorite) && matchesFilters;
  });

  // Обработка фильтров
  const toggleFilter = (filterKey) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterKey]: !prevFilters[filterKey],
    }));
  };

  // Модальное окно
  const modal = (
    <ModalRoot
      activeModal={activeEvent ? "eventDetails" : null}
      onClose={() => setActiveEvent(null)}
    >
      {activeEvent && (
        <ModalPage
          id="eventDetails"
          onClose={() => setActiveEvent(null)}
          header={
            <ModalPageHeader
              left={
                currentPlatform === "android" && (
                  <PanelHeaderButton onClick={() => setActiveEvent(null)}>
                    <Icon24Dismiss />
                  </PanelHeaderButton>
                )
              }
              right={
                currentPlatform === "ios" && (
                  <PanelHeaderButton onClick={() => setActiveEvent(null)}>
                    <Icon28CancelOutline />
                  </PanelHeaderButton>
                )
              }
            >
              {activeEvent.title}
            </ModalPageHeader>
          }
        >
          <Div>
            <img
              src={activeEvent.image}
              alt={activeEvent.title}
              style={{
                width: "100%",
                borderRadius: "8px",
                marginBottom: "16px",
              }}
            />
            <h4>Общая информация:</h4>
            <p>{activeEvent.description}</p>
            <h4>Дата:</h4>
            <p>{activeEvent.date}</p>
          </Div>
        </ModalPage>
      )}
    </ModalRoot>
  );

  return (
    <View activePanel={id} modal={modal}>
      <Panel id={id}>
        <PanelHeader>Мероприятия</PanelHeader>

        {/* Вкладки */}
        <Tabs>
          <TabsItem
            onClick={() => setActiveTab("leisure")}
            selected={activeTab === "leisure"}
          >
            Досуг
          </TabsItem>
          <TabsItem
            onClick={() => setActiveTab("places")}
            selected={activeTab === "places"}
          >
            Места
          </TabsItem>
          <TabsItem
            onClick={() => setActiveTab("development")}
            selected={activeTab === "development"}
          >
            Развитие
          </TabsItem>
        </Tabs>

        {/* Фильтры */}
        <Group header={<Header mode="secondary">Фильтры</Header>}>
          <Div>
            <Checkbox
              onChange={() => toggleFilter("творчество")}
              checked={!!filters["творчество"]}
            >
              Творчество
            </Checkbox>
            <Checkbox
              onChange={() => toggleFilter("история")}
              checked={!!filters["история"]}
            >
              История
            </Checkbox>
            <Checkbox
              onChange={() => toggleFilter("культура")}
              checked={!!filters["культура"]}
            >
              Культура
            </Checkbox>
            <Checkbox
              onChange={() => toggleFilter("образование")}
              checked={!!filters["образование"]}
            >
              Образование
            </Checkbox>
            <Button
              mode={showFavorites ? "primary" : "secondary"}
              onClick={() => setShowFavorites((prev) => !prev)}
              style={{ marginTop: "10px" }}
            >
              {showFavorites ? "Показать все" : "Показать избранное"}
            </Button>
          </Div>
        </Group>

        {/* События */}
        <Group header={<Header mode="secondary">События</Header>}>
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <Card
                key={event.id}
                style={{ margin: "8px 0" }}
                onClick={() => setActiveEvent(event)}
              >
                <SimpleCell
                  before={<Avatar src={event.image} size={48} />}
                  description={event.date}
                  after={
                    <Button
                      mode={
                        favorites.includes(event.id) ? "primary" : "secondary"
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(event.id);
                      }}
                    >
                      {favorites.includes(event.id)
                        ? "В избранном"
                        : "Избранное"}
                    </Button>
                  }
                >
                  {event.title}
                </SimpleCell>
              </Card>
            ))
          ) : (
            <Div>Нет событий, соответствующих фильтрам</Div>
          )}
        </Group>
      </Panel>
    </View>
  );
};

Home.propTypes = {
  id: PropTypes.string.isRequired,
};
