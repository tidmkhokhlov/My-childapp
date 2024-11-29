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
  PanelHeaderButton,
  platform,
} from "@vkontakte/vkui";
import { useState, useEffect } from "react";
import {
  Icon24Dismiss,
  Icon28CancelOutline,
  Icon28FavoriteOutline,
  Icon28Favorite,
  Icon24FavoriteOutline,
  Icon24Filter,
  Icon24Favorite,
} from "@vkontakte/icons";

// Импортируем данные для карточек
import events from "./eventsData";

// Компонент "О сервисе"
const ServiceInfo = () => (
  <Div
    style={{
      display: "flex",
      alignItems: "center",
      padding: "24px",
      backgroundColor: "#E0F7FA", // Светлый голубой фон
    }}
  >
    <Icon24FavoriteOutline
      style={{
        color: "#00B0FF", // Яркий голубой цвет иконки
        backgroundColor: "#B3E5FC", // Легкий голубой фон вокруг иконки
        borderRadius: "50%",
      }}
      width={32}
      height={32}
    />
    <Div style={{ marginLeft: "10px" }}>
      <div style={{ fontSize: "18px", fontWeight: "bold", color: "#0288D1" }}>
        Мой ребенок
      </div>{" "}
      {/* Темно-голубой для текста */}
      <div style={{ fontSize: "14px", color: "#0277BD" }}>О сервисе</div>{" "}
      {/* Средний голубой цвет */}
    </Div>
  </Div>
);

// eslint-disable-next-line react/prop-types
export const Home = ({ id }) => {
  const [activeTab, setActiveTab] = useState("leisure"); // Активная вкладка
  const [filters, setFilters] = useState({}); // Фильтры
  const [favorites, setFavorites] = useState(() => {
    // Инициализация favorites из localStorage
    const savedFavorites = localStorage.getItem("favorites");
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  });
  const [showFavorites, setShowFavorites] = useState(false); // Показать только избранное
  const [activeEvent, setActiveEvent] = useState(null); // Активное событие (для модалки)
  const [showFilterMenu, setShowFilterMenu] = useState(false); // Показать меню фильтров

  const currentPlatform = platform(); // Определяем платформу

  const sendFavoritesToServer = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/add_event_ids', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ event_ids: [42] }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Данные успешно отправлены на сервер:", data.message);
      } else {
        console.error("Ошибка при отправке данных на сервер");
      }
    } catch (error) {
      console.error("Ошибка при отправке запроса:", error);
    }
  };

  // Сохраняем изменения избранного в localStorage
  useEffect(() => {
    sendFavoritesToServer();
  }, [favorites]);

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

    // Проверяем, если хотя бы один активный фильтр совпадает с категорией мероприятия
    const matchesFilters = Object.entries(filters).some(
      ([key, value]) => value && event.category === key
    );

    // Возвращаем мероприятия, которые либо совпадают по фильтрам, либо находятся в избранном
    return (
      (!showFavorites || isFavorite) &&
      (matchesFilters || Object.values(filters).every((value) => !value))
    );
  });

  // Обработка фильтров
  const toggleFilter = (filterKey) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterKey]: !prevFilters[filterKey],
    }));
  };

  // Очистка избранного
  const clearFavorites = () => {
    localStorage.removeItem("favorites");
    setFavorites([]);
  };

  // Модальное окно
  const modal = (
    <ModalRoot
      activeModal={activeEvent ? "eventDetails" : null}
      onClose={() => setActiveEvent(null)}
      style={{ zIndex: 1000 }}
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
              <h3 style={{ fontSize: "23px", fontStyle: "italic", margin: 0 }}>
                {activeEvent.title}
              </h3>
            </ModalPageHeader>
          }
          style={{ zIndex: 1001 }}
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
            <div style={{ display: "flex", alignItems: "center" }}>
              <h4 style={{ margin: 0, marginRight: "8px" }}>Дата:</h4>
              <p style={{ margin: 0 }}>{activeEvent.date}</p>
            </div>
          </Div>
        </ModalPage>
      )}
    </ModalRoot>
  );

  return (
    <Panel id={id}>
      {/* Блок "о сервисе" */}
      <ServiceInfo />
      {modal}
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

      {/* Кнопки для показа меню фильтров и избранного */}
      <Div style={{ display: "flex", justifyContent: "space-between" }}>
        <Button
          mode="primary"
          onClick={() => setShowFilterMenu((prev) => !prev)}
          style={{ margin: "10px 0" }}
          before={<Icon24Filter />}
        >
          Фильтр
        </Button>
        <Button
          mode={showFavorites ? "primary" : "secondary"}
          onClick={() => setShowFavorites((prev) => !prev)}
          style={{ margin: "10px 0" }}
          before={<Icon24Favorite />}
        >
          {showFavorites ? "Показать все" : "Показать избранное"}
        </Button>
      </Div>

      {/* Меню фильтров */}
      {showFilterMenu && (
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
          </Div>
        </Group>
      )}
      {/* События */}
      <Group header={<Header mode="secondary">События</Header>}>
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <Card key={event.id} style={{ margin: "8px 0" }}>
              <SimpleCell
                before={
                  <Avatar
                    src={event.image}
                    style={{
                      width: "300px",
                      height: "200px",
                      borderRadius: "12px",
                    }}
                  />
                }
                description={event.date}
                after={
                  <Button
                    mode="tertiary"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(event.id);
                    }}
                  >
                    {favorites.includes(event.id) ? (
                      <Icon28Favorite fill="light_blue" />
                    ) : (
                      <Icon28FavoriteOutline />
                    )}
                  </Button>
                }
              >
                <div
                  style={{
                    fontSize: "24px",
                    fontStyle: "italic",
                    fontFamily: "'Lato', sans-serif",
                    lineHeight: "1.3",
                  }}
                >
                  {event.title}
                </div>
                <div
                  style={{ fontSize: "16px", color: "#888", marginTop: "8px" }}
                >
                  <div>{event.location}</div>
                  <div>{event.date}</div>
                </div>
                {/* Кнопка "Подробнее" */}
                <Button
                  size="m"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveEvent(event);
                  }}
                  style={{ marginTop: "10px" }}
                >
                  Подробнее
                </Button>
              </SimpleCell>
            </Card>
          ))
        ) : (
          <Div>Нет событий, соответствующих фильтрам</Div>
        )}
      </Group>
    </Panel>
  );
};
