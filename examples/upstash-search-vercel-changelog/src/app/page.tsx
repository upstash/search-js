"use client";

import { useState } from "react";
import {
  Input,
  Button,
  DatePicker,
  Card,
  List,
  Space,
  Typography,
  Tag,
  message,
  Row,
  Col,
  Empty,
  Select,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import { intToDate } from "@/lib/dateUtils";
import { SearchAPIResponse } from "@/lib/types";

const { Title, Text, Link } = Typography;
const { RangePicker } = DatePicker;

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null);
  const [contentType, setContentType] = useState<"all" | "blog" | "changelog">(
    "all"
  );
  const [loading, setLoading] = useState(false);
  const [searchResponse, setSearchResponse] = useState<SearchAPIResponse | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      message.warning("Please enter a search query");
      return;
    }

    setLoading(true);
    try {
      const payload: {
        query: string;
        dateFrom?: string;
        dateUntil?: string;
        contentType?: string;
      } = {
        query: searchQuery,
      };

      if (dateRange) {
        if (dateRange[0]) {
          payload.dateFrom = dateRange[0].toISOString();
        }
        if (dateRange[1]) {
          payload.dateUntil = dateRange[1].toISOString();
        }
      }

      if (contentType !== "all") {
        payload.contentType = contentType;
      }

      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data = (await response.json()) as SearchAPIResponse;
      setSearchResponse(data);
    } catch (error) {
      console.error("Search error:", error);
      message.error("Failed to perform search");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateInt: number) => {
    const date = intToDate(dateInt);
    return dayjs(date).format("MMM DD, YYYY");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Title level={1} className="!mb-2 !text-3xl !font-bold">
            Vercel & Upstash Search Demo
          </Title>
          <Text className="text-gray-600 text-lg">
            Search through Vercel&apos;s changelog and blog entries (parsed from: <a href="https://vercel.com/atom" target="_blank" rel="noopener noreferrer">
              https://vercel.com/atom
            </a>). Source code and quickstart available on <a href="https://github.com/upstash/search-js/tree/main/examples/upstash-search-vercel-changelog" target="_blank" rel="noopener noreferrer">
              @upstash/search Repository.
            </a>
          </Text>
        </div>
      </div>

      {/* Search Section */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <Card className="shadow-sm border-0 rounded-xl">
          <Space direction="vertical" size="large" className="w-full">
            <div>
              <Text strong className="block mb-2">
                Search Query
              </Text>
              <Input
                size="large"
                placeholder="Search for features, updates, or announcements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onPressEnter={handleSearch}
                prefix={<SearchOutlined className="text-gray-400" />}
              />
            </div>

            <div className="flex flex-row gap-4 flex-wrap">
              <div className="w-[280px] flex flex-col">
                <Text strong className="block mb-2">
                  Date Range (Optional)
                </Text>
                <RangePicker
                  size="large"
                  value={dateRange}
                  onChange={setDateRange}
                  placeholder={["From date", "Until date"]}
                  className="w-full md:w-auto"
                  allowEmpty={[true, true]}
                />
                <Text className="text-gray-500 text-sm text-pretty mt-1">
                  You can select just one date or a range of dates
                </Text>
              </div>

              <div>
                <Text strong className="block mb-2">
                  Content Type
                </Text>
                <Select
                  size="large"
                  value={contentType}
                  onChange={setContentType}
                  className="w-full md:w-48"
                  placeholder="Select content type"
                >
                  <Select.Option value="all">All Content</Select.Option>
                  <Select.Option value="blog">Blog Posts</Select.Option>
                  <Select.Option value="changelog">
                    Changelog Entries
                  </Select.Option>
                </Select>
              </div>
            </div>

            <Button
              type="primary"
              size="large"
              loading={loading}
              onClick={handleSearch}
              icon={<SearchOutlined />}
              className="bg-black hover:bg-gray-800 border-black hover:border-gray-800"
            >
              Search
            </Button>
          </Space>
        </Card>

        {/* Results Section */}
        {searchResponse && (
          <div className="mt-8">
            <div className="mb-6">
              <Title level={3} className="!mb-2">
                Search Results
              </Title>
              <Text className="text-gray-600">
                Showing results for &quot;{searchResponse.query}&quot;
                {(searchResponse.filters.dateFrom || searchResponse.filters.dateUntil) && (
                  <>
                    {" "}
                    {searchResponse.filters.dateFrom && searchResponse.filters.dateUntil ? (
                      <>
                        from {dayjs(searchResponse.filters.dateFrom).format("MMM DD, YYYY")} to{" "}
                        {dayjs(searchResponse.filters.dateUntil).format("MMM DD, YYYY")}
                      </>
                    ) : searchResponse.filters.dateFrom ? (
                      <>on {dayjs(searchResponse.filters.dateFrom).format("MMM DD, YYYY")}</>
                    ) : (
                      <>until {dayjs(searchResponse.filters.dateUntil).format("MMM DD, YYYY")}</>
                    )}
                  </>
                )}
                {searchResponse.filters.contentType && searchResponse.filters.contentType !== "all" && (
                  <>
                    {" "}
                    in{" "}
                    {searchResponse.filters.contentType === "blog"
                      ? "blog posts"
                      : "changelog entries"}
                  </>
                )}
              </Text>
            </div>

            {searchResponse.results.length > 0 ? (
              <List
                dataSource={searchResponse.results}
                renderItem={(item) => (
                  <Card className="mb-4 shadow-sm border-0 rounded-xl hover:shadow-md transition-shadow">
                    <Row gutter={[16, 8]}>
                      <Col xs={24} sm={18}>
                        <Space
                          direction="vertical"
                          size="small"
                          className="w-full"
                        >
                          <Link
                            href={item.metadata?.url}
                            target="_blank"
                            className="!text-lg !font-semibold !text-black hover:!text-blue-600"
                          >
                            {item.content.title}
                          </Link>
                          <Text className="text-gray-600 text-base leading-relaxed">
                            {item.content.content}
                          </Text>
                        </Space>
                      </Col>
                      <Col xs={24} sm={6} className="text-right">
                        <Space direction="vertical" size="small" align="end">
                          <div className="flex flex-col gap-1">
                            <Tag color="blue" className="rounded-full">
                              Score: {item.score.toFixed(2)}
                            </Tag>
                            <Tag
                              color={
                                item.metadata?.kind === "blog"
                                  ? "green"
                                  : "orange"
                              }
                              className="rounded-full"
                            >
                              {item.metadata?.kind === "blog"
                                ? "Blog"
                                : "Changelog"}
                            </Tag>
                          </div>
                          <Text className="text-gray-500 text-sm">
                            {formatDate(item.metadata!.dateInt)}
                          </Text>
                        </Space>
                      </Col>
                    </Row>
                  </Card>
                )}
              />
            ) : (
              <Card className="shadow-sm border-0 rounded-xl">
                <Empty
                  description="No results found"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
