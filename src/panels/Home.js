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
  platform,
} from "@vkontakte/vkui";
import { useState, useEffect } from "react";
import {
  Icon28FavoriteOutline,
  Icon28Favorite,
  Icon24Filter,
} from "@vkontakte/icons";

import events from "./eventsData"; // Импортируем события из файла events.js

// Компонент "О сервисе"
const ServiceInfo = () => (
    <Div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "40px",
          backgroundColor: "#E0F7FA", // Светлый голубой фон
        }}
    >
      <Icon28FavoriteOutline
          style={{
            color: "#00B0FF",
            backgroundColor: "#B3E5FC",
            borderRadius: "50%",
          }}
          width={32}
          height={32}
      />
      <Div style={{ marginLeft: "10px" }}>
        <div style={{ fontSize: "24px", fontWeight: "bold", color: "#0288D1" }}>
          Мой ребенок
        </div>
        <div style={{ fontSize: "18px", color: "#0277BD" }}>О сервисе</div>
      </Div>
    </Div>
);

// Главный компонент
export const Home = ({ id }) => {
  const [activeTab, setActiveTab] = useState("recommendations");
  const [filters, setFilters] = useState({});
  const [favorites, setFavorites] = useState([]);
  const [myCircles, setMyCircles] = useState([]);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const currentPlatform = platform();

  const getFavoritesFromServer = async (vkId) => {
    try {
      // Отправляем GET-запрос на сервер для получения избранных мероприятий для данного vk_id
      const response = await fetch(`http://127.0.0.1:5000/get_event_ids/${vkId}`, {
        method: 'GET',
      });

      // Проверяем, был ли запрос успешным
      if (response.ok) {
        const data = await response.json();
        console.log("Избранные мероприятия для пользователя:", data);
        setFavorites(data.event_ids);  // Возвращаем список event_ids
      } else {
        console.error("Ошибка при получении данных с сервера");
        return [];
      }
    } catch (error) {
      console.error("Ошибка при отправке запроса:", error);
      return [];
    }
  };

  useEffect(() => {
    const vkId = "@aboba";
    getFavoritesFromServer(vkId); // Загружаем избранные мероприятия
  }, []);

  const sendFavoritesToServer = async (favorites_ids) => {
    try {
      const response = await fetch('http://127.0.0.1:5000/add_event_ids', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ event_ids: favorites_ids, vk_id: "@aboba" }),
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

  // Сохраняем изменения избранного в localStorage (уже не в localStorage;)
  useEffect(() => {
    if (favorites.length > 0) {
      sendFavoritesToServer(favorites); // Передаем актуальный список favorites
    } else {
      sendFavoritesToServer([0]);
    }
  }, [favorites]);

  const getMyCirclesFromServer = async (vkId) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/get_entry_ids/${vkId}`, {
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Мои круги (entry):", data);

        const entryIds = data.event_ids || [];
        const restoredCircles = entryIds.map((id) => {
          const event = findEventById(id);  // Ищем событие по ID только в категории leisure
          return event ? event : null;  // Если событие найдено, возвращаем его, иначе null
        });

        setMyCircles(restoredCircles.filter((event) => event !== null));  // Отфильтровываем null
      } else {
        console.error("Ошибка при получении данных myCircles с сервера");
      }
    } catch (error) {
      console.error("Ошибка при запросе myCircles с сервера:", error);
    }
  };


// Пример функции для поиска объекта мероприятия по ID
  const findEventById = (id) => {
    // Для поиска по всем категориям, проходим по всем ключам в объекте `events`
    for (const category in events) {
      if (Array.isArray(events[category])) {
        const event = events[category].find(event => event.id === id); // Ищем по ID в каждой категории
        if (event) {
          return event; // Возвращаем найденное событие
        }
      }
    }
    return null; // Возвращаем null, если не нашли событие
  };



  // Функция для отправки кругов (entry) на сервер
  const sendMyCirclesToServer = async (circles) => {
    try {
      // Извлекаем только id из объектов myCircles

      const circleIds = circles.map((circle) => circle.id);

      const response = await fetch('http://127.0.0.1:5000/add_entry_ids', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ entry_ids: circleIds, vk_id: "@aboba" }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Круги (entry) успешно отправлены:", data.message);
      } else {
        console.error("Ошибка при отправке данных myCircles на сервер");
      }
    } catch (error) {
      console.error("Ошибка при отправке данных myCircles на сервер:", error);
    }
  };

// Синхронизация изменений myCircles с сервером
  useEffect(() => {
    if (myCircles.length > 0) {
      sendMyCirclesToServer(myCircles); // Отправляем список объектов, из которых берется только id
    } else {
      sendMyCirclesToServer([{ id: 0, category: "none", date: "N/A", description: "No circles selected", image: "N/A", location: "N/A", title: "No Events" }]); // Отправляем пустой массив, если список пуст
    }
  }, [myCircles]);



  // Загрузка данных при монтировании компонента
  useEffect(() => {
    const vkId = "@aboba";
    getMyCirclesFromServer(vkId);
  }, []);

  // Синхронизация изменений favorites с сервером
  useEffect(() => {
    if (favorites.length > 0) {
      sendFavoritesToServer(favorites);
    } else {
      sendFavoritesToServer([0]); // Отправляем пустую запись, если список пуст
    }
  }, [favorites]);


  const toggleFavorite = (eventId) => {
    setFavorites((prevFavorites) =>
        prevFavorites.includes(eventId)
            ? prevFavorites.filter((id) => id !== eventId)
            : [...prevFavorites, eventId]
    );
  };

  const addToMyCircles = (event) => {
    if (!myCircles.some((circle) => circle.id === event.id)) {
      setMyCircles([...myCircles, event]);
    }
  };

  const removeFromMyCircles = (eventId) => {
    setMyCircles((prevCircles) =>
        prevCircles.filter((circle) => circle.id !== eventId)
    );
  };



  const filteredEvents =
      activeTab === "favorites"
          ? events.leisure
              .concat(events.places, events.development)
              .filter((event) => favorites.includes(event.id))
          : events.leisure
              .concat(events.places, events.development)
              .filter((event) => {
                const matchesFilters = Object.entries(filters).some(
                    ([key, value]) => value && event.category === key
                );
                return (
                    matchesFilters || Object.values(filters).every((value) => !value)
                );
              });

  const toggleFilter = (filterKey) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterKey]: !prevFilters[filterKey],
    }));
  };

  return (
      <Panel id={id}>
        <ServiceInfo />
        <Tabs>
          <TabsItem
              onClick={() => setActiveTab("recommendations")}
              selected={activeTab === "recommendations"}
              style={{ fontSize: "18px", padding: "18px" }}
          >
            <div style={{ fontSize: "20px" }}>Рекомендации</div>
          </TabsItem>
          <TabsItem
              onClick={() => setActiveTab("favorites")}
              selected={activeTab === "favorites"}
              style={{ fontSize: "18px", padding: "18px" }}
          >
            <div style={{ fontSize: "20px" }}>Избранное</div>
          </TabsItem>
          <TabsItem
              onClick={() => setActiveTab("collections")}
              selected={activeTab === "collections"}
              style={{ fontSize: "18px", padding: "18px" }}
          >
            <div style={{ fontSize: "20px" }}>Подборки</div>
          </TabsItem>
          <TabsItem
              onClick={() => setActiveTab("myCircles")}
              selected={activeTab === "myCircles"}
              style={{ fontSize: "18px", padding: "18px" }}
          >
            <div style={{ fontSize: "20px" }}>Мои кружки</div>
          </TabsItem>
        </Tabs>

        {activeTab === "recommendations" && (
            <>
              <Div style={{ display: "flex", justifyContent: "space-between" }}>
                <Button
                    mode="primary"
                    onClick={() => setShowFilterMenu((prev) => !prev)}
                    style={{ margin: "10px 0" }}
                    before={<Icon24Filter />}
                >
                  Фильтр
                </Button>
              </Div>

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

              <Group header={<Header mode="secondary">События</Header>}>
                {filteredEvents.length > 0 ? (
                    filteredEvents.map((event) => (
                        <Card key={event.id} style={{ margin: "8px 0", position: "relative", padding: "16px" }}>
                          <div style={{ display: "flex", alignItems: "flex-start" }}>
                            {/* Фото события */}
                            <Avatar
                                src={event.image}
                                style={{
                                  width: "300px",
                                  height: "200px",
                                  borderRadius: "12px",
                                  marginRight: "16px",
                                }}
                            />

                            {/* Основной текстовый блок */}
                            <div style={{ flex: 1 }}>
                              {/* Категория события */}
                              <div
                                  style={{
                                    fontSize: "11px", // 11pt
                                    fontFamily: "SF Pro Text",
                                    fontWeight: "600", // Semibold
                                    color: "#818C99", // Светло-серый цвет
                                    textTransform: "uppercase", // Caps
                                    marginBottom: "4px",
                                  }}
                              >
                                {event.category}
                              </div>

                              {/* Название события */}
                              <div
                                  style={{
                                    fontSize: "24px", // Обычный размер текста
                                    fontFamily: "SF Text Regular", // Шрифт
                                    fontWeight: "400", // Regular
                                    marginBottom: "8px",
                                  }}
                              >
                                {event.title}
                              </div>

                              {/* Описание события */}
                              <div
                                  style={{
                                    fontSize: "18px", // Обычный размер текста
                                    fontFamily: "SF Pro Text", // Шрифт
                                    fontWeight: "400", // Regular
                                    color: "#000000",
                                    marginBottom: "16px",
                                  }}
                              >
                                {event.description}
                              </div>

                              {/* Информация о цене, днях занятий и месте */}
                              <div
                                  style={{
                                    position: "absolute",
                                    bottom: "10px",
                                    left: "325px",
                                  }}
                              >
                                <div
                                    style={{
                                      fontSize: "14px", // SF Caption 1 Regular
                                      fontFamily: "SF Caption 1 Regular",
                                      fontWeight: "400",
                                      color: "#818C99", // Светло-серый цвет
                                    }}
                                >
                                  {event.price} ₽
                                </div>
                                <div
                                    style={{
                                      fontSize: "14px", // SF Caption 1 Regular
                                      fontFamily: "SF Pro Text",
                                      fontWeight: "400",
                                      color: "#818C99", // Светло-серый цвет
                                    }}
                                >
                                  {event.schedule} {event.location}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Иконка избранного в правом верхнем углу */}
                          <div style={{ position: "absolute", top: "10px", right: "10px" }}>
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
                          </div>

                          {/* Кнопка "Записаться" в правом нижнем углу */}
                          <div style={{ position: "absolute", bottom: "10px", right: "10px" }}>
                            <Button
                                size="m"
                                style={{
                                  fontSize: "14px", // SF Caption 1 Regular
                                  fontFamily: "SF Caption 1 Regular",
                                  fontWeight: "400",
                                }}
                                onClick={() =>
                                    myCircles.some((circle) => circle.id === event.id)
                                        ? removeFromMyCircles(event.id)
                                        : addToMyCircles(event)
                                }
                            >
                              {myCircles.some((circle) => circle.id === event.id)
                                  ? "Вы записаны"
                                  : "Записаться"}
                            </Button>
                          </div>
                        </Card>
                    ))
                ) : (
                    <Div>Нет событий, соответствующих фильтрам</Div>
                )}
              </Group>






            </>
        )}

        {activeTab === "favorites" && (
            <Group header={<Header mode="secondary">Избранные события</Header>}>
              {favorites.length > 0 ? (
                  events.leisure
                      .concat(events.places, events.development)
                      .filter((event) => favorites.includes(event.id))
                      .map((event) => (
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
                            >
                              <div style={{ fontSize: "24px" }}>{event.title}</div>
                              <Button
                                  size="m"
                                  mode="destructive"
                                  onClick={() => toggleFavorite(event.id)}
                                  style={{ marginTop: "10px" }}
                              >
                                Удалить из избранного
                              </Button>
                            </SimpleCell>
                          </Card>
                      ))
              ) : (
                  <Div>У вас нет избранных событий.</Div>
              )}
            </Group>
        )}

        {activeTab === "myCircles" && (
            <Group header={<Header mode="secondary">Мои кружки</Header>}>
              {myCircles.length > 0 ? (
                  myCircles.map((circle) => (
                      <Card key={circle.id} style={{ margin: "8px 0" }}>
                        <SimpleCell
                            before={
                              <Avatar
                                  src={circle.image}
                                  style={{
                                    width: "300px",
                                    height: "200px",
                                    borderRadius: "12px",
                                  }}
                              />
                            }
                            description={circle.date}
                        >
                          <div
                              style={{
                                fontSize: "24px",
                                fontStyle: "italic",
                                marginBottom: "10px",
                              }}
                          >
                            {circle.title}
                          </div>
                          <Button
                              size="m"
                              mode="destructive"
                              onClick={() => removeFromMyCircles(circle.id)}
                              style={{
                                marginTop: "10px",
                                backgroundColor: "#FFCDD2",
                              }}
                          >
                            Удалить из моих кружков
                          </Button>
                        </SimpleCell>
                      </Card>
                  ))
              ) : (
                  <Div>У вас нет кружков.</Div>
              )}
            </Group>
        )}
      </Panel>
  );
};
